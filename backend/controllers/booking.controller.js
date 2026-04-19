const { CreateBooking, GetAllBookings } = require("../services/booking.service")

async function CreateUserBooking(req,res) {
    try {
        const {event, date, packageName, phone} = req.body

        if(!event || !packageName || !date || !phone){
            return res.status(401).json({
                message: "Invalid Information!"
            })
        }

        const result = await CreateBooking(event, date, packageName, phone)

        if(!result.success){
            return res.status(401).json(result)
        }

        return res.status(200).json(result)
    } catch (error) {
        console.log("Error In Booking Creation (Controller): ", error)
    }
}

async function GetAllUserBookings(req,res) {
    try {
        const {phone} = req.body

        if(!phone){
            return res.status(401).json({
                message: "Invalid Phone Number!"
            })
        }

        const result = await GetAllBookings(phone)

        if(!result.success){
            return res.status(401).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log("Error In Getting Bookings (Controller): ", error)
    }
}

module.exports = {
    CreateUserBooking,
    GetAllUserBookings
}