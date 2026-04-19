const express = require("express")
const { CreateUserBooking, GetAllUserBookings } = require("../controllers/booking.controller")
const { route } = require("./user.route")
const router = express.Router()

router.post("/createBooking", CreateUserBooking)
router.get("/getAllUserBookings", GetAllUserBookings)

module.exports = router