const { CreateBooking, GetAllBookings, GetAllBookingsUnfiltered, UpdateBooking ,DeleteBooking } = require("../services/booking.service")

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

async function GetAllBookingsAdmin(req, res) {
    try {
        const result = await GetAllBookingsUnfiltered()

        if(!result?.success){
            return res.status(200).json(result)
        }

        console.log(result)

        return res.status(200).json(result)

    } catch (error) {
        console.log("Error In Getting All Bookings (Controller): ", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function UpdateUserBooking(req, res) {
    try {
        const { id, event, date, packageName, phone, client, guests, venue, totalAmount, advancePaid, paymentMethod, paymentNote, status } = req.body

        console.log("Update Booking Request:", { id, event, date, packageName, phone, client, guests, venue, totalAmount, advancePaid, paymentMethod, paymentNote, status })

        if(!id){
            return res.status(400).json({
                message: "Booking ID is required!"
            })
        }

        if(!event || !packageName || !date || !phone || !client || !venue){
            return res.status(400).json({
                message: "Missing required fields: event, date, packageName, phone, client, venue!"
            })
        }

        const result = await UpdateBooking(id, {
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

        console.log("Update Result:", result)

        if(!result?.success){
            return res.status(400).json(result || { message: "Failed to update booking" })
        }

        return res.status(200).json(result)
    } catch (error) {
        console.log("Error In Booking Update (Controller): ", error)
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}
async function DeleteUserBooking(req, res) {
    try {
        const { id } = req.body

        if(!id){
            return res.status(400).json({
                message: "Booking ID is required!"
            })
        }

        const result = await DeleteBooking(id)

        if(!result?.success){
            return res.status(400).json(result || { message: "Failed to delete booking" })
        }

        return res.status(200).json(result)
    } catch (error) {
        console.log("Error In Booking Delete (Controller): ", error)
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}


module.exports = {
    CreateUserBooking,
    GetAllUserBookings,
    GetAllBookingsAdmin,
    UpdateUserBooking,
    DeleteUserBooking
}