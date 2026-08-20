const { db } = require("../config/db"); // Adjust path to your Drizzle DB instance
const { payments, booking } = require("../model/schema");
const { eq, sql } = require("drizzle-orm");

/**
 * Fetch all payments for the Cashflow ledger
 */
const fetchAllPayments = async () => {
  return await db
    .select()
    .from(payments)
    .orderBy(sql`${payments.created_at} DESC`);
};

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
const recordPayment = async ({ bookingId, amount, category, payment_method, bank_name, note, isFinished, client }) => {
  const numericAmount = parseFloat(amount);

  return await db.transaction(async (tx) => {
    // 1. Check if booking exists
    const [existingBooking] = await tx
      .select()
      .from(booking)
      .where(eq(booking.id, parseInt(bookingId)));

    if (!existingBooking) {
      throw new Error("BOOKING_NOT_FOUND");
    }

    // 2. Insert new transaction into payments table with correct schema fields
    const [newPayment] = await tx
      .insert(payments)
      .values({
        flow: "IN",
        bookingId: parseInt(bookingId),
        amount: numericAmount.toString(),
        category: category || (isFinished ? "Event Final Settlement" : "Booking Advance"),
        payment_method: payment_method || "Cash",
        bank_name: bank_name || null,
        who: client || existingBooking.client,
        note: note || null,
      })
      .returning();

    // 3. Update cumulative advance_paid on booking record
    const updatedAdvancePaid = (parseFloat(existingBooking.advance_paid) || 0) + numericAmount;

    const updateData = {
      advance_paid: updatedAdvancePaid.toString(),
      updated_at: new Date(),
    };

    // If marking as finished, update status and track settlement method
    if (isFinished) {
      updateData.status = "Finished";
      updateData.payment_method = payment_method || existingBooking.payment_method;
      updateData.bank_name = bank_name || null;
    } else if (updatedAdvancePaid >= parseFloat(existingBooking.total_amount)) {
      // Auto-complete status if fully paid
      updateData.status = "Finished";
      updateData.payment_method = payment_method || existingBooking.payment_method;
      updateData.bank_name = bank_name || null;
    }

    await tx
      .update(booking)
      .set(updateData)
      .where(eq(booking.id, parseInt(bookingId)));

    return newPayment;
  });
};

/**
 * Delete/rollback a payment entry and adjust booking cumulative totals
 */
const removePayment = async (paymentId) => {
  return await db.transaction(async (tx) => {
    // 1. Locate payment transaction
    const [paymentToDelete] = await tx
      .select()
      .from(payments)
      .where(eq(payments.id, parseInt(paymentId)));

    if (!paymentToDelete) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    // 2. Delete payment entry
    await tx.delete(payments).where(eq(payments.id, parseInt(paymentId)));

    // 3. Adjust associated booking totals
    const [associatedBooking] = await tx
      .select()
      .from(booking)
      .where(eq(booking.id, paymentToDelete.bookingId));

    if (associatedBooking) {
      const currentPaid = parseFloat(associatedBooking.advance_paid) || 0;
      const newPaid = Math.max(0, currentPaid - parseFloat(paymentToDelete.amount));

      await tx
        .update(booking)
        .set({
          advance_paid: newPaid.toString(),
          updated_at: new Date(),
        })
        .where(eq(booking.id, associatedBooking.id));
    }

    return true;
  });
};

module.exports = {
  fetchAllPayments,
  fetchPaymentsByBookingId,
  recordPayment,
  removePayment,
};