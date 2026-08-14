const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentsByBooking,
  createPayment,
  deletePayment,
} = require("../controllers/payment.controller");

router.get("/", getAllPayments);
router.get("/booking/:bookingId", getPaymentsByBooking);
router.post("/", createPayment);
router.delete("/:id", deletePayment);

module.exports = router;