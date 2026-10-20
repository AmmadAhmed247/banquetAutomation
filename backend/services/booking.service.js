const { eq, and, ne, sql } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking, payments, addons } = require("../model/schema");
const { sendMessage } = require("./meta.service.");
const { getOrCreateUser } = require("./user.service");
const paymentService = require("./payment.service");

const ADVANCE = "Booking Advance";
const SETTLEMENT = "Event Final Settlement";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function cleanPaymentInputs(list) {
  return (Array.isArray(list) ? list : [])
    .map((p) => {
      const method = p.method || p.paymentMethod || "Cash";
      return {
        id: p.id,
        amount: Math.round(Number(p.amount) * 100) / 100,
        method,
        bankName: method !== "Cash" ? (p.bankName || "").slice(0, 50) || null : null,
        note: (p.note || "").slice(0, 255) || null,
        date: p.date ? new Date(p.date) : new Date(),
      };
    })
    .filter((p) => Number.isFinite(p.amount) && p.amount > 0);
}

function sumCents(list) {
  return list.reduce((s, p) => s + Math.round(p.amount * 100), 0);
}

/**
 * Make the DB "Booking Advance" rows match the list the UI sent:
 * update rows whose id exists, insert new ones, delete removed ones.
 * Then recompute booking.advance_paid. Returns the new advance total.
 */
async function syncAdvancePayments(tx, saved, incoming, { client, rNo, event }) {
  const existing = await tx
    .select()
    .from(payments)
    .where(and(eq(payments.bookingId, saved.id), eq(payments.category, ADVANCE)));

  const existingById = new Map(existing.map((r) => [String(r.id), r]));
  const keepIds = new Set();

  for (const p of incoming) {
    const match = existingById.get(String(p.id));
    const values = {
      amount: p.amount.toFixed(2),
      payment_method: p.method,
      bank_name: p.bankName,
      note: (p.note || `Advance for booking #${rNo || saved.id} (${event})`).slice(0, 255),
      payment_date: p.date,
      who: client,
    };

    if (match) {
      keepIds.add(String(match.id));
      await tx.update(payments).set(values).where(eq(payments.id, match.id));
    } else {
      await tx.insert(payments).values({
        ...values,
        flow: "IN",
        category: ADVANCE,
        bookingId: saved.id,
      });
    }
  }

  for (const row of existing) {
    if (!keepIds.has(String(row.id))) {
      await tx.delete(payments).where(eq(payments.id, row.id));
    }
  }

  return paymentService.syncBookingAdvanceTotal(tx, saved.id);
}

function mapBooking(b, paymentList, addonTotal = 0, settlementRows = []) {
  const settlementPaid = settlementRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return {
    ...b,
    userId: b.user_id || b.userId,
    package: b.package_name,
    totalAmount: b.total_amount !== undefined ? Number(b.total_amount) : undefined,
    baseAmount: b.total_amount !== undefined ? Number(b.total_amount) - addonTotal : undefined,
    advanceAmount: b.advance_amount !== undefined ? Number(b.advance_amount) : undefined,
    advancePaid: b.advance_paid !== undefined ? Number(b.advance_paid) : undefined,
    settlementPaid,
    totalReceived: (Number(b.advance_paid || 0) || 0) + settlementPaid,
    settlementPaymentMethod: settlementRows[0]?.payment_method || b.payment_method,
    settlementBankName: settlementRows[0]?.bank_name || "",
    advanceDueDate: b.advance_due_date,
    paymentMethod: b.payment_method,
    paymentNote: b.payment_note,
    timeSlot: b.time_slot,
    bankName: b.bank_name,
    rNo: b.r_no,
    payments: paymentList || [],
  };
}

async function loadBookingsWithPayments() {
  const [bookings, advanceRows, settlementRows, addonTotals] = await Promise.all([
    db.select().from(booking),
    db
      .select()
      .from(payments)
      .where(eq(payments.category, ADVANCE))
      .orderBy(
        sql`COALESCE(${payments.payment_date}, ${payments.created_at}) ASC, ${payments.id} ASC`
      ),
    db
      .select()
      .from(payments)
      .where(and(
        eq(payments.category, SETTLEMENT),
        eq(payments.flow, "IN")
      ))
      .orderBy(sql`${payments.created_at} DESC`),
    db
      .select({
        bookingId: addons.bookingId,
        total: sql`COALESCE(SUM(${addons.client_price}), 0)`,
      })
      .from(addons)
      .groupBy(addons.bookingId),
  ]);

  const byBooking = new Map();
  for (const p of advanceRows) {
    if (!byBooking.has(p.bookingId)) byBooking.set(p.bookingId, []);
    byBooking.get(p.bookingId).push({
      id: p.id,
      amount: Number(p.amount),
      method: p.payment_method,
      bankName: p.bank_name || "",
      note: p.note || "",
      date: p.payment_date || p.created_at,
    });
  }

  const settlementsByBooking = new Map();
  for (const payment of settlementRows) {
    if (!settlementsByBooking.has(payment.bookingId)) settlementsByBooking.set(payment.bookingId, []);
    settlementsByBooking.get(payment.bookingId).push(payment);
  }

  const addonTotalsByBooking = new Map(
    addonTotals.map((row) => [row.bookingId, Number(row.total || 0)])
  );

  return bookings.map((b) =>
    mapBooking(
      b,
      byBooking.get(b.id),
      addonTotalsByBooking.get(b.id) || 0,
      settlementsByBooking.get(b.id) || []
    )
  );
}

function handleUniqueViolation(error) {
  if (error?.code === "23505") {
    if (error?.constraint?.includes("unique_active_booking_slot")) {
      return { success: false, message: "That hall is already booked for this date and shift." };
    }
    if (error?.constraint?.includes("r_no")) {
      return { success: false, message: "That receipt number is already used on another booking." };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

async function CreateBooking(bookingData) {
  try {
    const {
      rNo,
      event,
      date,
      packageName,
      phone,
      client,
      guests = 0,
      venue,
      totalAmount = 0,
      advanceAmount = 0,
      advanceDueDate = null,
      paymentMethod = "Cash",
      paymentNote = "",
      status = "Pending",
      timeSlot = "Night",
      bankName = null,
      payments: paymentInputs,
      advancePaid = 0, // legacy fallback only
    } = bookingData;

    console.log("PAYMENTS IN:", JSON.stringify(bookingData.payments));

    const bookingDate = new Date(date);

    if (rNo) {
      const dupRNo = await db.select().from(booking).where(eq(booking.r_no, rNo));
      if (dupRNo.length > 0) {
        return {
          success: false,
          message: `Receipt number ${rNo} is already used on another booking.`,
        };
      }
    }

    const clash = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.venue, venue),
          eq(booking.date, bookingDate),
          eq(booking.time_slot, timeSlot),
          ne(booking.status, "Cancelled")
        )
      );

    if (clash.length > 0) {
      return {
        success: false,
        message: `${venue} already has a booking for the ${timeSlot} slot on this date.`,
      };
    }

    let incoming = cleanPaymentInputs(paymentInputs);
    if (incoming.length === 0 && Number(advancePaid) > 0) {
      incoming = cleanPaymentInputs([
        { amount: advancePaid, method: paymentMethod, bankName, note: paymentNote },
      ]);
    }

    const paidCents = sumCents(incoming);
    if (Number(totalAmount) > 0 && paidCents > Math.round(Number(totalAmount) * 100)) {
      return { success: false, message: "Payments exceed the total amount." };
    }
    const paidTotal = paidCents / 100;

    const newBooking = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(booking)
        .values({
          r_no: rNo || null,
          event,
          date: bookingDate,
          package_name: packageName,
          phone,
          client,
          guests,
          venue,
          total_amount: totalAmount.toString(),
          advance_amount: (Number(advanceAmount) || paidTotal).toString(),
          advance_paid: "0", // set by the sync below
          advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,
          payment_method: incoming[0]?.method || paymentMethod,
          payment_note: incoming[0]?.note || paymentNote,
          time_slot: timeSlot,
          bank_name: incoming[0]?.bankName || bankName || null,
          status,
        })
        .returning();

      await syncAdvancePayments(tx, created, incoming, { client, rNo, event });

      const [fresh] = await tx.select().from(booking).where(eq(booking.id, created.id));
      return fresh;
    });

    return {
      success: true,
      booking: newBooking,
      message: "Booking created successfully!",
    };
  } catch (error) {
    const handled = handleUniqueViolation(error);
    if (handled) return handled;
    console.log("Error In Booking Creation (Service): ", error);
    return {
      success: false,
      message: "Failed to create booking",
      error: error.message,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

async function GetAllBookings() {
  try {
    const mapped = await loadBookingsWithPayments();
    if (mapped.length === 0) {
      return { success: true, bookings: [], message: "No bookings found" };
    }
    return { success: true, bookings: mapped };
  } catch (error) {
    console.log("Error On Getting Bookings (Service): ", error);
    return { success: false, message: "Failed to fetch bookings", error: error.message };
  }
}

const GetAllBookingsUnfiltered = GetAllBookings;

/* ------------------------------------------------------------------ */
/* Update                                                              */
/* ------------------------------------------------------------------ */

async function UpdateBooking(bookingId, bookingData) {
  try {
    const {
      event,
      date,
      rNo,
      packageName,
      phone,
      client,
      guests = 0,
      venue,
      totalAmount = 0,
      advanceAmount = 0,
      advanceDueDate = null,
      paymentMethod = "Cash",
      paymentNote = "",
      timeSlot = "",
      bankName = "",
      status = "Pending",
      settlementPaymentMethod = "Cash",
      settlementBankName = "",
      payments: paymentInputs,
    } = bookingData;

    const bookingDate = new Date(date);

    console.log("PAYMENTS IN:", JSON.stringify(bookingData.payments));

    if (rNo) {
      const dupRNo = await db
        .select()
        .from(booking)
        .where(and(eq(booking.r_no, rNo), ne(booking.id, bookingId)));

      if (dupRNo.length > 0) {
        return {
          success: false,
          message: `Receipt number ${rNo} is already used on another booking.`,
        };
      }
    }

    const clash = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.venue, venue),
          eq(booking.date, bookingDate),
          eq(booking.time_slot, timeSlot),
          ne(booking.status, "Cancelled"),
          ne(booking.id, bookingId)
        )
      );

    if (clash.length > 0) {
      return {
        success: false,
        message: `${venue} already has a booking for the ${timeSlot} slot on this date.`,
      };
    }

    const [existing] = await db
      .select({ id: booking.id })
      .from(booking)
      .where(eq(booking.id, bookingId));

    if (!existing) {
      return { success: false, message: "Booking Not Found!" };
    }

    // Only touch advance rows if the client actually sent a payments array
    const hasPayments = Array.isArray(paymentInputs);
    const incoming = hasPayments ? cleanPaymentInputs(paymentInputs) : null;

    if (
      incoming &&
      Number(totalAmount) > 0 &&
      sumCents(incoming) > Math.round(Number(totalAmount) * 100)
    ) {
      return { success: false, message: "Payments exceed the total amount." };
    }

    const FINISHED = ["finished", "completed"];
    const isNowFinished = FINISHED.includes((status || "").toLowerCase());

    const savedBooking = await db.transaction(async (tx) => {
      const updateSet = {
        event,
        date: bookingDate,
        package_name: packageName,
        phone,
        client,
        guests,
        venue,
        total_amount: totalAmount.toString(),
        advance_amount: advanceAmount.toString(),
        advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,
        payment_method: paymentMethod,
        payment_note: paymentNote,
        time_slot: timeSlot,
        bank_name: bankName || null,
        r_no: rNo || null,
        status,
        updated_at: new Date(),
        // advance_paid is intentionally NOT set here; the sync below owns it
      };

      // Keep the booking's summary payment fields pointing at the first payment
      if (incoming && incoming.length > 0) {
        updateSet.payment_method = incoming[0].method;
        updateSet.bank_name = incoming[0].bankName;
        updateSet.payment_note = incoming[0].note || paymentNote;
      }

      const updatedBooking = await tx
        .update(booking)
        .set(updateSet)
        .where(eq(booking.id, bookingId))
        .returning();

      if (!updatedBooking.length) {
        throw Object.assign(new Error("Booking Not Found!"), { notFound: true });
      }

      const saved = updatedBooking[0];

      if (incoming) {
        await syncAdvancePayments(tx, saved, incoming, { client, rNo, event });
      }

      // Keep one settlement row equal to the outstanding balance.
      const settlementPayments = await tx
        .select()
        .from(payments)
        .where(and(
          eq(payments.bookingId, saved.id),
          eq(payments.category, SETTLEMENT),
          eq(payments.flow, "IN")
        ))
        .orderBy(sql`${payments.created_at} DESC`);

      if (isNowFinished) {
        const [{ receivedBeforeSettlement }] = await tx
          .select({
            receivedBeforeSettlement: sql`COALESCE(SUM(${payments.amount}), 0)`,
          })
          .from(payments)
          .where(and(
            eq(payments.bookingId, saved.id),
            eq(payments.flow, "IN"),
            ne(payments.category, SETTLEMENT)
          ));
        const remaining = Math.max(
          0,
          Number(totalAmount || 0) - Number(receivedBeforeSettlement || 0)
        );
        const settleMethod = settlementPaymentMethod || "Cash";
        const settleBank =
          settleMethod === "Cash" ? null : (settlementBankName || "").slice(0, 50) || null;

        if (remaining > 0) {
          const settleValues = {
            amount: remaining.toFixed(2),
            payment_method: settleMethod,
            bank_name: settleBank,
            who: client,
            note: `Final settlement for booking #${rNo || saved.id} (${event})`,
          };

          const [settlementPayment, ...duplicateSettlements] = settlementPayments;
          if (settlementPayment) {
            await tx.update(payments).set(settleValues).where(eq(payments.id, settlementPayment.id));
          } else {
            await tx.insert(payments).values({
              ...settleValues,
              flow: "IN",
              category: SETTLEMENT,
              bookingId: saved.id,
              payment_date: new Date(),
            });
          }
          for (const duplicate of duplicateSettlements) {
            await tx.delete(payments).where(eq(payments.id, duplicate.id));
          }
        } else {
          for (const settlementPayment of settlementPayments) {
            await tx.delete(payments).where(eq(payments.id, settlementPayment.id));
          }
        }

        await tx
          .update(booking)
          .set({ payment_method: settleMethod, bank_name: settleBank })
          .where(eq(booking.id, saved.id));
      } else if (settlementPayments.length > 0) {
        // Status moved back from Finished: that settlement never happened
        for (const settlementPayment of settlementPayments) {
          await tx.delete(payments).where(eq(payments.id, settlementPayment.id));
        }
      }

      const [fresh] = await tx.select().from(booking).where(eq(booking.id, saved.id));
      return fresh;
    });

    return { success: true, booking: savedBooking, message: "Booking updated successfully!" };
  } catch (error) {
    if (error?.notFound) {
      return { success: false, message: "Booking Not Found!" };
    }
    const handled = handleUniqueViolation(error);
    if (handled) return handled;
    console.log("Error In Booking Update (Service): ", error);
    return { success: false, message: "Failed to update booking", error: error.message };
  }
}

/* ------------------------------------------------------------------ */
/* Delete / misc                                                       */
/* ------------------------------------------------------------------ */

async function DeleteBooking(bookingId) {
  try {
    // payments.booking_id has ON DELETE CASCADE, so payment rows go with it
    const deletedBooking = await db
      .delete(booking)
      .where(eq(booking.id, bookingId))
      .returning();

    if (!deletedBooking || deletedBooking.length === 0) {
      return { success: false, message: "Booking Not Found!" };
    }

    return {
      success: true,
      booking: deletedBooking[0],
      message: "Booking deleted successfully!",
    };
  } catch (error) {
    console.log("Error In Booking Delete (Service): ", error);
    return { success: false, message: "Failed to delete booking", error: error.message };
  }
}

function parseWhatsAppMessage(body, phone) {
  if (!body?.toUpperCase().startsWith("BOOK:")) return null;
  const parts = body.slice(5).split("|").map((s) => s.trim());
  const [date, event, pkg] = parts;
  if (!date || !event) return null;
  return { phone, date, event, package: pkg || "Standard" };
}

async function addBookingNote(bookingId, noteText, options = {}) {
  const { overwrite = false } = options;

  if (!bookingId) throw new Error("bookingId is required");
  if (!noteText || !noteText.trim()) throw new Error("noteText is required");

  const existing = await db
    .select({ id: booking.id, note: booking.note })
    .from(booking)
    .where(eq(booking.id, bookingId))
    .limit(1);

  if (existing.length === 0) {
    const err = new Error(`Booking with id ${bookingId} not found`);
    err.statusCode = 404;
    throw err;
  }

  const currentNote = existing[0].note;

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const newNoteEntry = `[${timestamp}] ${noteText.trim()}`;

  const finalNote = overwrite
    ? newNoteEntry
    : currentNote
      ? `${currentNote}\n${newNoteEntry}`
      : newNoteEntry;

  const [updated] = await db
    .update(booking)
    .set({
      note: finalNote,
      updated_at: sql`now()`,
    })
    .where(eq(booking.id, bookingId))
    .returning();

  return updated;
}

module.exports = {
  CreateBooking,
  GetAllBookings,
  GetAllBookingsUnfiltered,
  UpdateBooking,
  parseWhatsAppMessage,
  DeleteBooking,
  addBookingNote,
};