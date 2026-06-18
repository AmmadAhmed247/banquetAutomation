const express = require("express")
const { CreateUserBooking, GetAllUserBookings, GetAllBookingsAdmin, UpdateUserBooking , DeleteUserBooking } = require("../controllers/booking.controller")
const { route } = require("./user.route")
const router = express.Router()

router.post("/createBooking", CreateUserBooking)
router.post("/getAllUserBookings", GetAllUserBookings)
router.get("/allBookings", GetAllBookingsAdmin)
router.put("/updateBooking", UpdateUserBooking)
router.delete("/deleteBooking", DeleteUserBooking);

module.exports = router