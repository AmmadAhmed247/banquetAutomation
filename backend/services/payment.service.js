const { db } = require("../config/db"); // Adjust path to your Drizzle DB instance
const { payments, booking } = require("../model/schema");
const { eq, and, sql } = require("drizzle-orm");


const ADVANCE = "Booking Advance";
const SETTLEMENT = "Event Final Settlement";

/**
 * Fetch all payments for the Cashflow ledger
 */
const fetchAllPayments = async () => {
  return await db
    .select()
    .from(payments)
    .orderBy(sql`${payments.created_at} DESC`);
};

async function syncBookingAdvanceTotal(tx, bookingId) {
  const [row] = await tx
    .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(and(
      eq(payments.bookingId, bookingId),
      eq(payments.category, ADVANCE),
      eq(payments.flow, "IN")
    ));
  const total = Number(row?.total || 0);
  await tx.update(booking)
    .set({ advance_paid: total.toFixed(2), updated_at: new Date() })
    .where(eq(booking.id, bookingId));
  return total;
}

/**
 * Fetch all payments associated with a specific booking
 */
const fetchPaymentsByBookingId = async (bookingId) => {
  return await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, parseInt(bookingId)))
    .orderBy(sql`${payments.created_at} DESC`);
};

/**
 * Record a new payment and update the parent booking record atomically
 */
const recordPayment = async ({
  bookingId,
  amount,
  category,
  payment_method,
  bank_name,
  note,
  isFinished,
  client,
  payment_date,
}) => {
  const id = parseInt(bookingId);
  const numericAmount = Math.round(parseFloat(amount) * 100) / 100;
 
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }
 
  return await db.transaction(async (tx) => {
    const [existingBooking] = await tx
      .select()
      .from(booking)
      .where(eq(booking.id, id));
 
    if (!existingBooking) {
      throw new Error("BOOKING_NOT_FOUND");
    }
 
    const resolvedCategory =
      category || (isFinished ? SETTLEMENT : ADVANCE);
    const method = payment_method || "Cash";
 
    const [newPayment] = await tx
      .insert(payments)
      .values({
        flow: "IN",
        bookingId: id,
        amount: numericAmount.toFixed(2),
        category: resolvedCategory,
        payment_method: method,
        bank_name: method === "Cash" ? null : (bank_name || "").slice(0, 50) || null,
        who: client || existingBooking.client,
        note: note ? String(note).slice(0, 255) : null,
        payment_date: payment_date ? new Date(payment_date) : new Date(),
      })
      .returning();
 
    // advance_paid only tracks advance rows
    if (resolvedCategory === ADVANCE) {
      await syncBookingAdvanceTotal(tx, id);
    }
 
    // Total money received (advances + settlements) decides auto-finish
    const [{ received }] = await tx
      .select({ received: sql`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(and(eq(payments.bookingId, id), eq(payments.flow, "IN")));
 
    const total = parseFloat(existingBooking.total_amount) || 0;
    const updateData = { updated_at: new Date() };
 
    if (isFinished || (total > 0 && Number(received) >= total)) {
      updateData.status = "Finished";
      updateData.payment_method = method;
      updateData.bank_name = method === "Cash" ? null : (bank_name || "").slice(0, 50) || null;
    }
 
    await tx.update(booking).set(updateData).where(eq(booking.id, id));
 
    return newPayment;
  });
};
 

/**
 * Delete/rollback a payment entry and adjust booking cumulative totals
 */
const removePayment = async (paymentId) => {
  return await db.transaction(async (tx) => {
    const [paymentToDelete] = await tx
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(paymentId)));
 
    if (!paymentToDelete) {
      throw new Error("PAYMENT_NOT_FOUND");
    }
 
    await tx.delete(payments).where(eq(payments.id, paymentToDelete.id));
 
    if (paymentToDelete.bookingId && paymentToDelete.category === ADVANCE) {
      await syncBookingAdvanceTotal(tx, paymentToDelete.bookingId);
    }
 
    return true;
  });
};
 

module.exports = {
  fetchAllPayments,
  fetchPaymentsByBookingId,
  recordPayment,
  removePayment,
  syncBookingAdvanceTotal
};