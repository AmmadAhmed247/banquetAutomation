const cron = require("node-cron")
const { db } = require("../config/db")
const { booking, user } = require("../model/schema")
const { and, gte, lte, eq } = require("drizzle-orm")
const { sendMessage } = require("../services/meta.service.")

async function sendBookingReminders() {
    try {
        const tommorow = new Date()
        tommorow.setDate(tommorow.getDate() + 1)
        tommorow.setHours(0, 0, 0, 0)

        const dayAfter = new Date(tommorow)
        dayAfter.setHours(23, 59, 59, 999)

        console.log(`Checking bookings for ${tomorrow.toDateString()}`);

        const upComingbookings = await db
            .select({
                bookingId: booking.id,
                event: booking.event,
                date: booking.date,
                package: booking.package_name,
                userName: user.name,
                userPhone: user.phone
            })
            .from(booking)
            .leftJoin(user, eq(booking.userId, user.id))
            .where(
                and(
                    gte(booking.date, tommorow),
                    lte(booking.date, dayAfter),
                    eq(booking.status, "booked")
                )
            )

        if (!upComingbookings) {
            console.log("No bookings Found!")
            return;
        }

        for (const booking of upComingbookings) {
            await sendMessage(
                booking.userPhone,
                `Hello ${booking.userName}! \n\nThis is a reminder that your *${booking.event}* is scheduled for *tomorrow*.\n\nPackage: ${booking.package}\n\nPlease contact us if you need anything.\n\nThank you for choosing Hall Automation! 🎉`
            )
            console.log(`Reminder sent to ${booking.userName} (${booking.userPhone})`);

        }

    } catch (error) {
        console.error("Reminder job error:", error);
    }

    cron.schedule("0 9 * * *", ()=> {
        console.log("Running Booking Reminder...")
        sendBookingReminders()
    })
}

module.exports = {
    sendBookingReminders
}