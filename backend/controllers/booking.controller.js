const { CreateBooking, GetAllBookings } = require("../services/booking.service")

async function CreateUserBooking(req,res) {
    try {
        const {event, date, packageName, phone, client, guests, venue, totalAmount, advancePaid, paymentMethod, paymentNote, status} = req.body

        if(!event || !packageName || !date || !phone || !client || !venue){
            return res.status(400).json({
                message: "Missing required fields: event, date, packageName, phone, client, venue!"
            })
        }

        const result = await CreateBooking({
            event,
            date,
            packageName,
            phone,
            client,
            guests: guests || 0,
            venue,
            totalAmount: totalAmount || 0,
            advancePaid: advancePaid || 0,
            paymentMethod: paymentMethod || "Cash",
            paymentNote: paymentNote || "",
            status: status || "Pending"
        })

        if(!result?.success){
            return res.status(401).json(result || { message: "Failed to create booking" })
        }

        return res.status(200).json(result)
    } catch (error) {
        console.log("Error In Booking Creation (Controller): ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function GetAllUserBookings(req,res) {
    try {
        const {phone} = req.body

        if(!phone){
            return res.status(400).json({
                message: "Phone number is required!"
            })
        }

        const result = await GetAllBookings(phone)

        if(!result?.success){
            return res.status(200).json(result)
        }

        return res.status(200).json(result)

    } catch (error) {
        console.log("Error In Getting Bookings (Controller): ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    CreateUserBooking,
    GetAllUserBookings
}