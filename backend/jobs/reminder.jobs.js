const cron = require("node-cron")
const { db } = require("../config/db")
const { booking } = require("../model/schema")
const { and, gte, lte, lt, eq, or, isNull , inArray } = require("drizzle-orm")
const { sendAdvanceReminder, sendBookingReminder, sleep } = require("../services/meta.service..js")

// CONSTANTS
const BOOKING_STATUS_PENDING = "Pending" 
const ADVANCE_REMINDER_INTERVAL_DAYS = 2  
const WHATSAPP_SEND_DELAY_MS = 1200       
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000  


function getDayWindowPKT(daysFromNow) {
    const pktNow = new Date(Date.now() + PKT_OFFSET_MS)
    const pktTarget = new Date(pktNow)
    pktTarget.setUTCDate(pktTarget.getUTCDate() + daysFromNow)
    pktTarget.setUTCHours(0, 0, 0, 0)

    const startUTC = new Date(pktTarget.getTime() - PKT_OFFSET_MS)
    const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1)

    return { start: startUTC, end: endUTC }
}
function normalizePakistaniNumber(phone) {
    // strip anything that isn't a digit
    let digits = String(phone).replace(/\D/g, "");

    // strip leading 0 (local format: 03XXXXXXXXX)
    if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    // strip 92 if someone already added it, so we don't double it up
    if (digits.startsWith("92")) {
        digits = digits.slice(2);
    }

    // now digits should be 10 digits like 3XXXXXXXXX
    return `92${digits}`;
}

async function processBatch(rows, sendFn, jobName) {
    let sent = 0, failed = 0

    for (const row of rows) {
        try {
            const result = await sendFn(row)
            if (result?.success === false) {
                failed++
                console.error(`[${jobName}] Failed for ${row.client} (${row.phone}):`, result.error)
            } else {
                sent++
            }
        } catch (err) {
            failed++
            console.error(`[${jobName}] Unexpected error for ${row.client} (${row.phone}):`, err.message)
        }
        await sleep(WHATSAPP_SEND_DELAY_MS)
    }

    console.log(`[${jobName}] Done. Sent: ${sent}, Failed: ${failed}, Total: ${rows.length}`)
}


async function sendBookingReminders() {
    try {
        const { start, end } = getDayWindowPKT(2);
        console.log(`[BookingReminder] Checking window ${start.toISOString()} - ${end.toISOString()}`)

        const rows = await db
            .select({
                bookingId: booking.id,
                client: booking.client,
                phone: booking.phone,
                event: booking.event,
                date: booking.date, 
                venue: booking.venue,
            })
            .from(booking)
            .where(
                and(
                    gte(booking.date, start),
                    lte(booking.date, end),
                    // Matches both "Confirmed" and "Finished" statuses
                    inArray(booking.status, ["Confirmed", "Finished"]),
                    eq(booking.booking_reminder_sent, false)
                )
            )

        if (rows.length === 0) {
            console.log("[BookingReminder] Nothing to send.")
            return
        }

        await processBatch(rows, async (bk) => {
            const formattedDate = new Date(bk.date).toISOString().split('T')[0]

            const result = await sendBookingReminder(
                bk.phone,
                "en",
                bk.client, 
                bk.event, 
                formattedDate, 
                bk.venue
            )
            
            if (result.success) {
                console.log("Meta API Response Data:", JSON.stringify(result.data, null, 2))
                await db.update(booking)
                    .set({ booking_reminder_sent: true })
                    .where(eq(booking.id, bk.bookingId))
            }
            return result
        }, "BookingReminder")

    } catch (error) {
        console.error("[BookingReminder] Job-level error:", error)
    }
}

// 2. ADVANCE DUE REMINDER (repeats every N days until paid)
async function sendAdvanceDueReminders() {
    try {
        const now = new Date()
        const throttleThreshold = new Date(now.getTime() - ADVANCE_REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000)

        console.log(`[AdvanceReminder] Checking dues as of ${now.toISOString()}`)

        const rows = await db
            .select({
                bookingId: booking.id,
                client: booking.client,
                phone: booking.phone,
                event: booking.event,
                venue: booking.venue,
                advanceAmount: booking.advance_amount,
                advancePaid: booking.advance_paid,
            })
            .from(booking)
            .where(
                and(
                    lte(booking.advance_due_date, now),
                    eq(booking.status, "Pending"),
                    lt(booking.advance_paid, booking.advance_amount),
                    or(
                        isNull(booking.last_advance_reminder_at),
                        lt(booking.last_advance_reminder_at, throttleThreshold)
                    )
                )
            )

        if (rows.length === 0) {
            console.log("[AdvanceReminder] Nothing to send.")
            return
        }

        await processBatch(rows, async (bk) => {
            const remaining = (Number(bk.advanceAmount) - Number(bk.advancePaid)).toFixed(2)
            
            // Using the dedicated advance reminder function
            const result = await sendAdvanceReminder(
                bk.phone,
                "en",
                bk.client, 
                bk.event, 
                remaining
            )
            
            if (result.success) {
                console.log("Meta API Response Data:", JSON.stringify(result.data, null, 2))
                await db.update(booking)
                    .set({ last_advance_reminder_at: new Date() })
                    .where(eq(booking.id, bk.bookingId))
            }
            return result
        }, "AdvanceReminder")

    } catch (error) {
        console.error("[AdvanceReminder] Job-level error:", error)
    }
}

// SCHEDULER (registered once at module load) 
function startReminderJobs() {
    cron.schedule("0 9 * * *", async () => {
        console.log("=== Running test reminder job ===")
        await sendBookingReminders()
        await sendAdvanceDueReminders()
        console.log("=== Test job complete ===")
    })
    console.log("Reminder cron jobs scheduled ")
}

module.exports = {
    startReminderJobs,
    sendBookingReminders,
    sendAdvanceDueReminders,
}