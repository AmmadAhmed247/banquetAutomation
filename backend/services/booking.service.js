const { eq } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { sendMessage } = require("./meta.service.");
const { getOrCreateUser } = require("./user.service");

async function CreateBooking(bookingData) {
    try {
        const {
            event,
            date,
            packageName,
            phone,
            client = "New Client",
            guests = 0,
            venue,
            totalAmount = 0,
            totalAdvanceAmount = 0,
            advancePaid = 0,
            advanceDueDate = null,   
            paymentMethod = "Cash",
            paymentNote = "",
            status = "Pending"
        } = bookingData

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
            date: new Date(date),
            package_name: packageName,
            phone: phone,
            client: client,
            guests: guests,
            venue: venue,
            total_amount: totalAmount.toString(),
            advance_amount: totalAdvanceAmount.toString(),
            advance_paid: advancePaid.toString(),
            advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,   // ← added
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

        try {
            await sendMessage(phone, `Your booking for ${newBooking.event} on ${newBooking.date} has been confirmed by our team!`)
        } catch (msgError) {
            console.log("Warning: Failed to send message:", msgError.message)
        }

        return {
            success: true,
            booking: newBooking,
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
        // .where(eq(booking.phone, phone))


        if(!bookings || bookings.length === 0){
            return {
                success: true,
                bookings: [],
                message: "No bookings found"
            }
        }

        // Map snake_case DB fields to camelCase expected by frontend
        const mapped = bookings.map(b => ({
            ...b,
            id: b.id,
            userId: b.user_id || b.userId,
            client: b.client,
            phone: b.phone,
            guests: b.guests,
            date: b.date,
            event: b.event,
            package: b.package_name,
            package_name: b.package_name,
            totalAmount: b.total_amount !== undefined ? Number(b.total_amount) : undefined,
            total_amount: b.total_amount,
            advanceAmount: b.advance_amount !== undefined ? Number(b.advance_amount) : undefined,
            advance_amount: b.advance_amount,
            advancePaid: b.advance_paid !== undefined ? Number(b.advance_paid) : undefined,
            advance_paid: b.advance_paid,
            advanceDueDate: b.advance_due_date,
            advance_due_date: b.advance_due_date,
            paymentMethod: b.payment_method,
            payment_method: b.payment_method,
            paymentNote: b.payment_note,
            payment_note: b.payment_note,
            status: b.status,
            created_at: b.created_at,
            updated_at: b.updated_at
        }))

        return {
            success: true,
            bookings: mapped
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

async function GetAllBookingsUnfiltered() {
    try {
        const bookings = await db
        .select()
        .from(booking)

        if(!bookings || bookings.length === 0){
            return {
                success: true,
                bookings: [],
                message: "No bookings found"
            }
        }

        const mapped = bookings.map(b => ({
            ...b,
            id: b.id,
            userId: b.user_id || b.userId,
            client: b.client,
            phone: b.phone,
            guests: b.guests,
            date: b.date,
            event: b.event,
            package: b.package_name,
            package_name: b.package_name,
            totalAmount: b.total_amount !== undefined ? Number(b.total_amount) : undefined,
            total_amount: b.total_amount,
            advanceAmount: b.advance_amount !== undefined ? Number(b.advance_amount) : undefined,
            advance_amount: b.advance_amount,
            advancePaid: b.advance_paid !== undefined ? Number(b.advance_paid) : undefined,
            advance_paid: b.advance_paid,
            advanceDueDate: b.advance_due_date,
            advance_due_date: b.advance_due_date,
            paymentMethod: b.payment_method,
            payment_method: b.payment_method,
            paymentNote: b.payment_note,
            payment_note: b.payment_note,
            status: b.status,
            created_at: b.created_at,
            updated_at: b.updated_at
        }))

        return {
            success: true,
            bookings: mapped
        }
    } catch (error) {
        console.log("Error On Getting All Bookings (Service): ", error)
        return {
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        }
    }
}

async function UpdateBooking(bookingId, bookingData) {
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
            advanceAmount = 0,
            advancePaid = 0,
            advanceDueDate = null,   
            paymentMethod = "Cash",
            paymentNote = "",
            status = "Pending"
        } = bookingData

        const updatedBooking = await db
        .update(booking)
        .set({
            event: event,
            date: new Date(date),
            package_name: packageName,
            phone: phone,
            client: client,
            guests: guests,
            venue: venue,
            total_amount: totalAmount.toString(),
            advance_amount: advanceAmount.toString(),
            advance_paid: advancePaid.toString(),
            advance_due_date: advanceDueDate ? new Date(advanceDueDate) : null,   
            payment_method: paymentMethod,
            payment_note: paymentNote,
            status: status,
            updated_at: new Date()
        })
        .where(eq(booking.id, bookingId))
        .returning()


        console.log("Updated booking result:", updatedBooking)

        if(!updatedBooking || updatedBooking.length === 0){
            return {
                success: false,
                message: "Booking Not Found!"
            }
        }

        return {
            success: true,
            booking: updatedBooking[0],
            message: "Booking updated successfully!"
        }

    } catch (error) {
        console.log("Error In Booking Update (Service): ", error)
        return {
            success: false,
            message: "Failed to update booking",
            error: error.message
        }
    }
}
async function DeleteBooking(bookingId) {
    try {
        const deletedBooking = await db
        .delete(booking)
        .where(eq(booking.id, bookingId))
        .returning()

        if(!deletedBooking || deletedBooking.length === 0){
            return {
                success: false,
                message: "Booking Not Found!"
            }
        }

        return {
            success: true,
            booking: deletedBooking[0],
            message: "Booking deleted successfully!"
        }

    } catch (error) {
        console.log("Error In Booking Delete (Service): ", error)
        return {
            success: false,
            message: "Failed to delete booking",
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


module.exports = {
    CreateBooking,
    GetAllBookings,
    GetAllBookingsUnfiltered,
    UpdateBooking,
    parseWhatsAppMessage,
    DeleteBooking
}