const express = require("express")
const { CreateUserBooking, GetAllUserBookings, GetAllBookingsController, UpdateUserBooking } = require("../controllers/booking.controller")
const { route } = require("./user.route")
const router = express.Router()

router.post("/createBooking", CreateUserBooking)
router.post("/getAllUserBookings", GetAllUserBookings)
router.get("/allBookings", GetAllBookingsController)
router.put("/updateBooking", UpdateUserBooking)

module.exports = router