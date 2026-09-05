const { eq, and, ne, sql } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking, payments } = require("../model/schema");
const { sendMessage } = require("./meta.service.");
const { getOrCreateUser } = require("./user.service");
const paymentService = require("./payment.service");

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
      totalAdvanceAmount = 0,
      advancePaid = 0,
      advanceDueDate = null,
      paymentMethod = "Cash",
      paymentNote = "",
      status = "Pending",
      timeSlot = "Night",
      bankName = null,
    } = bookingData;

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

    const newBooking = await db
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
        advance_amount: totalAdvanceAmount.toString(),
        advance_paid: advancePaid.toString(),
        advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,
        payment_method: paymentMethod,
        payment_note: paymentNote,
        time_slot: timeSlot,
        bank_name: bankName || null,
        status,
      })
      .returning();

    // Record the advance payment correctly
    if (Number(advancePaid) > 0) {
      await db.insert(payments).values({
        flow: "IN",
        category: "Booking Advance",
        amount: advancePaid.toString(),
        payment_method: paymentMethod || "Cash",
        bank_name: bankName || null,
        who: client,
        note: `Advance for booking #${rNo || newBooking[0].id} (${event})`,
        bookingId: newBooking[0].id,
      });
    }

    return {
      success: true,
      booking: newBooking[0],
      message: "Booking created successfully!",
    };
  } catch (error) {
    if (error?.code === "23505") {
      if (error?.constraint?.includes("unique_active_booking_slot")) {
        return { success: false, message: "That hall is already booked for this date and shift." };
      }
      if (error?.constraint?.includes("r_no")) {
        return { success: false, message: "That receipt number is already used on another booking." };
      }
    }
    console.log("Error In Booking Creation (Service): ", error);
    return {
      success: false,
      message: "Failed to create booking",
      error: error.message,
    };
  }
}

async function GetAllBookings(phone) {
  try {
    const bookings = await db.select().from(booking);

    if (!bookings || bookings.length === 0) {
      return { success: true, bookings: [], message: "No bookings found" };
    }

    const mapped = bookings.map((b) => ({
      ...b,
      id: b.id,
      userId: b.user_id || b.userId,
      client: b.client,
      phone: b.phone,
      guests: b.guests,
      date: b.date,
      event: b.event,
      package: b.package_name,
      package_name: b.package_name,
      totalAmount: b.total_amount !== undefined ? Number(b.total_amount) : undefined,
      total_amount: b.total_amount,
      advanceAmount: b.advance_amount !== undefined ? Number(b.advance_amount) : undefined,
      advance_amount: b.advance_amount,
      advancePaid: b.advance_paid !== undefined ? Number(b.advance_paid) : undefined,
      advance_paid: b.advance_paid,
      advanceDueDate: b.advance_due_date,
      advance_due_date: b.advance_due_date,
      paymentMethod: b.payment_method,
      payment_method: b.payment_method,
      paymentNote: b.payment_note,
      payment_note: b.payment_note,
      status: b.status,
      timeSlot: b.time_slot,
      bankName: b.bank_name,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));

    return { success: true, bookings: mapped };
  } catch (error) {
    console.log("Error On Getting Bookings (Service): ", error);
    return { success: false, message: "Failed to fetch bookings", error: error.message };
  }
}

async function GetAllBookingsUnfiltered() {
  try {
    const bookings = await db.select().from(booking);

    if (!bookings || bookings.length === 0) {
      return { success: true, bookings: [], message: "No bookings found" };
    }

    const mapped = bookings.map((b) => ({
      ...b,
      id: b.id,
      userId: b.user_id || b.userId,
      client: b.client,
      phone: b.phone,
      guests: b.guests,
      date: b.date,
      event: b.event,
      package: b.package_name,
      package_name: b.package_name,
      totalAmount: b.total_amount !== undefined ? Number(b.total_amount) : undefined,
      total_amount: b.total_amount,
      advanceAmount: b.advance_amount !== undefined ? Number(b.advance_amount) : undefined,
      advance_amount: b.advance_amount,
      advancePaid: b.advance_paid !== undefined ? Number(b.advance_paid) : undefined,
      advance_paid: b.advance_paid,
      advanceDueDate: b.advance_due_date,
      advance_due_date: b.advance_due_date,
      paymentMethod: b.payment_method,
      payment_method: b.payment_method,
      paymentNote: b.payment_note,
      payment_note: b.payment_note,
      status: b.status,
      timeSlot: b.time_slot,
      bankName: b.bank_name,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));

    return { success: true, bookings: mapped };
  } catch (error) {
    console.log("Error On Getting All Bookings (Service): ", error);
    return { success: false, message: "Failed to fetch all bookings", error: error.message };
  }
}

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
      advancePaid = 0,
      advanceDueDate = null,
      paymentMethod = "Cash",
      paymentNote = "",
      timeSlot = "",
      bankName = "",
      status = "Pending",
      settlementPaymentMethod = "Cash",
      settlementBankName = "",
    } = bookingData;

    const bookingDate = new Date(date);

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
      .select({ status: booking.status, advance_paid: booking.advance_paid })
      .from(booking)
      .where(eq(booking.id, bookingId));

    if (!existing) {
      return { success: false, message: "Booking Not Found!" };
    }

    const FINISHED = ["finished", "completed"];
    const isNowFinished = FINISHED.includes((status || "").toLowerCase());

    const savedBooking = await db.transaction(async (tx) => {
      const updatedBooking = await tx
        .update(booking)
        .set({
          event,
          date: bookingDate,
          package_name: packageName,
          phone,
          client,
          guests,
          venue,
          total_amount: totalAmount.toString(),
          advance_amount: advanceAmount.toString(),
          advance_paid: advancePaid.toString(),
          advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,
          payment_method: paymentMethod,
          payment_note: paymentNote,
          time_slot: timeSlot,
          bank_name: bankName || null,
          r_no: rNo || null,
          status,
          updated_at: new Date(),
        })
        .where(eq(booking.id, bookingId))
        .returning();

      if (!updatedBooking.length) {
        throw Object.assign(new Error("Booking Not Found!"), { notFound: true });
      }

      const saved = updatedBooking[0];
      const newAdvance = Number(advancePaid || 0);

      // Keep a single "Booking Advance" payment row synced to the
      // booking's CURRENT truth (amount, method, bank, client, note) on
      // every edit — instead of only ever inserting positive deltas, which
      // left stale rows behind whenever an amount was corrected downward
      // or a method/bank/client was changed after the fact.
      const [existingAdvancePayment] = await tx
        .select()
        .from(payments)
        .where(and(
          eq(payments.bookingId, saved.id),
          eq(payments.category, "Booking Advance")
        ))
        .orderBy(sql`${payments.created_at} DESC`)
        .limit(1);

      if (newAdvance > 0) {
        if (existingAdvancePayment) {
          await tx.update(payments)
            .set({
              amount: newAdvance.toString(),
              payment_method: paymentMethod || "Cash",
              bank_name: bankName || null,
              who: client,
              note: `Advance for booking #${rNo || saved.id} (${event})`,
            })
            .where(eq(payments.id, existingAdvancePayment.id));
        } else {
          await tx.insert(payments).values({
            flow: "IN",
            category: "Booking Advance",
            amount: newAdvance.toString(),
            payment_method: paymentMethod || "Cash",
            bank_name: bankName || null,
            who: client,
            note: `Advance for booking #${rNo || saved.id} (${event})`,
            bookingId: saved.id,
          });
        }
      } else if (existingAdvancePayment) {
        // Advance corrected down to zero — no cashflow record should remain.
        await tx.delete(payments).where(eq(payments.id, existingAdvancePayment.id));
      }

      // Keep the "Event Final Settlement" row synced the same way, using
      // the NEW advancePaid (not existing.advance_paid, which was the
      // pre-update value and caused wrong remaining-balance math whenever
      // advance and status were both changed in the same edit).
      const [settlementPayment] = await tx
        .select()
        .from(payments)
        .where(and(
          eq(payments.bookingId, saved.id),
          eq(payments.category, "Event Final Settlement")
        ))
        .orderBy(sql`${payments.created_at} DESC`)
        .limit(1);

      if (isNowFinished) {
        const remaining = Number(totalAmount || 0) - newAdvance;

        if (remaining > 0) {
          if (settlementPayment) {
            await tx.update(payments)
              .set({
                amount: remaining.toString(),
                payment_method: settlementPaymentMethod || "Cash",
                bank_name: settlementBankName || null,
                who: client,
                note: `Final settlement for booking #${rNo || saved.id} (${event})`,
              })
              .where(eq(payments.id, settlementPayment.id));
          } else {
            await tx.insert(payments).values({
              flow: "IN",
              category: "Event Final Settlement",
              amount: remaining.toString(),
              payment_method: settlementPaymentMethod || "Cash",
              bank_name: settlementBankName || null,
              who: client,
              note: `Final settlement for booking #${rNo || saved.id} (${event})`,
              bookingId: saved.id,
            });
          }
        } else if (settlementPayment) {
          // Fully paid off by the advance alone — no remaining balance owed.
          await tx.delete(payments).where(eq(payments.id, settlementPayment.id));
        }

        await tx
          .update(booking)
          .set({
            payment_method: settlementPaymentMethod || "Cash",
            bank_name: settlementBankName || null,
          })
          .where(eq(booking.id, saved.id));
      } else if (settlementPayment) {
        // Status moved back to Pending/Confirmed/etc. — that settlement
        // never actually happened, so the cashflow record shouldn't
        // pretend it did.
        await tx.delete(payments).where(eq(payments.id, settlementPayment.id));
      }

      return saved;
    });

    return { success: true, booking: savedBooking, message: "Booking updated successfully!" };
  } catch (error) {
    if (error?.notFound) {
      return { success: false, message: "Booking Not Found!" };
    }
    if (error?.code === "23505") {
      if (error?.constraint?.includes("unique_active_booking_slot")) {
        return { success: false, message: "That hall is already booked for this date and shift." };
      }
      if (error?.constraint?.includes("r_no")) {
        return { success: false, message: "That receipt number is already used on another booking." };
      }
    }
    console.log("Error In Booking Update (Service): ", error);
    return { success: false, message: "Failed to update booking", error: error.message };
  }
}

async function DeleteBooking(bookingId) {
  try {
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