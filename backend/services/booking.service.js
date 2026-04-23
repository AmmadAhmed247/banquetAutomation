const { eq } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { sendMessage } = require("./twillo.service");

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

        await sendMessage(phone, `Your booking for ${booking.event} on ${booking.date} has been confirmed by our team!`)

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

function parseWhatsAppMessage(body, phone) {
  if (!body?.toUpperCase().startsWith("BOOK:")) return null;

  const parts = body.slice(5).split("|").map(s => s.trim());
  const [date, event, pkg] = parts;

  if (!date || !event) return null;

  return {
    phone,
    date,
    event,
    package: pkg || "Standard",
  };
}

module.exports = { parseWhatsAppMessage };

module.exports = {
    CreateBooking,
    GetAllBookings,
    parseWhatsAppMessage
}