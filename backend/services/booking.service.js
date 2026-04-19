const { eq } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking } = require("../model/schema");

async function CreateBooking(event, date, packageName, phone) {
    try {
        const [newBooking] = await db
        .insert(booking)
        .values({
            event: event,
            date: date,
            package_name: packageName,
            phone: phone
        })
        .returning()

        if(!newBooking){
            return {
                success: false,
                message: "Booking Not Created!"
            }
        }

        return {
            success: true,
            newBooking
        }

    } catch (error) {
        console.log("Error In Booking Creation (Service) ", error)
    }
}

async function GetAllBookings(phone) {
    try {
        const allBookings = await db
        .select()
        .from(booking)
        .where(eq(booking.phone, phone))


        if(!allBookings || allBookings.length === 0){
            return {
                success: false,
                message: "No Bookings Found!"
            }
        }

        return {
            success: true,
            allBookings
        }
    } catch (error) {
        console.log("Error On Getting Bookings (Service): ", error)
    }
}

module.exports = {
    CreateBooking,
    GetAllBookings
}