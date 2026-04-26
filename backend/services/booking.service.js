const { eq } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { sendMessage } = require("./twillo.service");
const { getOrCreateUser } = require("./user.service");

async function CreateBooking(bookingData) {
    try {
        const {
            event,
            date,
            packageName,
            phone,
            client,
            guests = 0,
            venue,
            totalAmount = 0,
            advancePaid = 0,
            paymentMethod = "Cash",
            paymentNote = "",
            status = "Pending"
        } = bookingData

        // Create or get user first
        const userResult = await getOrCreateUser(phone, client)
        if (!userResult?.success || !userResult?.user) {
            return {
                success: false,
                message: "Failed to create/retrieve user",
                error: userResult?.error
            }
        }

        const userId = Array.isArray(userResult.user) ? userResult.user[0]?.id : userResult.user?.id

        const [newBooking] = await db
        .insert(booking)
        .values({
            userId: userId,
            event: event,
            date: date,
            package_name: packageName,
            phone: phone,
            client: client,
            guests: guests,
            venue: venue,
            total_amount: totalAmount.toString(),
            advance_paid: advancePaid.toString(),
            payment_method: paymentMethod,
            payment_note: paymentNote,
            status: status
        })
        .returning()

        if(!newBooking){
            return {
                success: false,
                message: "Booking Not Created!"
            }
        }

        // Send message, but don't fail if it errors
        try {
            await sendMessage(phone, `Your booking for ${newBooking.event} on ${newBooking.date} has been confirmed by our team!`)
        } catch (msgError) {
            console.log("Warning: Failed to send message:", msgError.message)
        }

        await db
        .update(booking)
        .set({
            status: "Confirmed"
        })
        .where(eq(booking.id, newBooking.id))

        const updatedBooking = await db
        .select()
        .from(booking)
        .where(eq(booking.id, newBooking.id))

        return {
            success: true,
            booking: updatedBooking[0],
            message: "Booking created successfully!"
        }

    } catch (error) {
        console.log("Error In Booking Creation (Service): ", error)
        return {
            success: false,
            message: "Failed to create booking",
            error: error.message
        }
    }
}

async function GetAllBookings(phone) {
    try {
        const bookings = await db
        .select()
        .from(booking)
        .where(eq(booking.phone, phone))


        if(!bookings || bookings.length === 0){
            return {
                success: true,
                bookings: [],
                message: "No bookings found"
            }
        }

        return {
            success: true,
            bookings: bookings
        }
    } catch (error) {
        console.log("Error On Getting Bookings (Service): ", error)
        return {
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        }
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