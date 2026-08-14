const paymentService = require("../services/payment.service");

// GET /api/payments
const getAllPayments = async (req, res) => {
  try {
    const data = await paymentService.fetchAllPayments();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return res.status(500).json({ success: false, message: "Server error fetching payments" });
  }
};

// GET /api/payments/booking/:bookingId
const getPaymentsByBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const data = await paymentService.fetchPaymentsByBookingId(bookingId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getPaymentsByBooking:", error);
    return res.status(500).json({ success: false, message: "Server error fetching booking payments" });
  }
};

// POST /api/payments
const createPayment = async (req, res) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ success: false, message: "Booking ID and Amount are required." });
  }

  try {
    const data = await paymentService.recordPayment(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error in createPayment:", error);

    if (error.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Associated booking not found" });
    }

    return res.status(500).json({ success: false, message: "Failed to process payment transaction" });
  }
};

// DELETE /api/payments/:id
const deletePayment = async (req, res) => {
  const { id } = req.params;

  try {
    await paymentService.removePayment(id);
    return res.status(200).json({ success: true, message: "Payment removed successfully" });
  } catch (error) {
    console.error("Error in deletePayment:", error);

    if (error.message === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    return res.status(500).json({ success: false, message: "Failed to delete payment transaction" });
  }
};

module.exports = {
  getAllPayments,
  getPaymentsByBooking,
  createPayment,
  deletePayment,
};