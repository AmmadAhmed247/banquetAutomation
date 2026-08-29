const express = require("express")
const { CreateUserBooking, GetAllUserBookings, GetAllBookingsAdmin, UpdateUserBooking , DeleteUserBooking, addNoteToBooking } = require("../controllers/booking.controller")
const router = express.Router()

router.post("/createBooking", CreateUserBooking)
router.post("/getAllUserBookings", GetAllUserBookings)
router.get("/allBookings", GetAllBookingsAdmin)
router.put("/updateBooking", UpdateUserBooking)
router.delete("/deleteBooking", DeleteUserBooking);
router.post("/note", addNoteToBooking);




module.exports = router