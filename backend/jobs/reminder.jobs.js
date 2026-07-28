const cron = require("node-cron")
const { db } = require("../config/db")
const { booking } = require("../model/schema")
const { and, gte, lte, lt, eq, or, isNull } = require("drizzle-orm")
const { sendTemplateMessage, sleep } = require("../services/meta.service..js")

// CONSTANTS
const BOOKING_STATUS_ACTIVE = "Confirmed" 
const ADVANCE_REMINDER_INTERVAL_DAYS = 2  // don't nag daily, every 2 days
const WHATSAPP_SEND_DELAY_MS = 1200       // gap between sends to avoid Meta rate limits
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

// DAY-BEFORE EVENT REMINDER (sent once) 
async function sendBookingReminders() {
    try {
        const { start, end } = getDayWindowPKT(1)
        console.log(`[BookingReminder] Checking window ${start.toISOString()} - ${end.toISOString()}`)

        const rows = await db
            .select({
                bookingId: booking.id,
                client: booking.client,
                phone: booking.phone,
                event: booking.event,
                package: booking.package_name,
            })
            .from(booking)
            .where(
                and(
                    gte(booking.date, start),
                    lte(booking.date, end),
                    eq(booking.status, BOOKING_STATUS_ACTIVE),
                    eq(booking.booking_reminder_sent, false)
                )
            )

        if (rows.length === 0) {
            console.log("[BookingReminder] Nothing to send.")
            return
        }

        await processBatch(rows, async (bk) => {
            const result = await sendTemplateMessage(
                bk.phone,
                "booking_reminder_v1", // TODO: your approved template name
                "en",
            )
            if (result.success) {
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

//2. ADVANCE DUE REMINDER (repeats every N days until paid)
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
                package: booking.package_name,
                advanceAmount: booking.advance_amount,
                advancePaid: booking.advance_paid,
            })
            .from(booking)
            .where(
                and(
                    lte(booking.advance_due_date, now),
                    eq(booking.status, BOOKING_STATUS_ACTIVE),
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
            const result = await sendTemplateMessage(
                bk.phone,
                "advance_due_v1", // TODO: your approved template name
                "en",
                [bk.client, bk.event, remaining]
            )
            if (result.success) {
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

// RESOURCE/ADD-ONS REMINDER (sent once, 2 days before event) 
async function sendResourceReminders() {
    try {
        const { start, end } = getDayWindowPKT(2)
        console.log(`[ResourceReminder] Checking window ${start.toISOString()} - ${end.toISOString()}`)

        const rows = await db
            .select({
                bookingId: booking.id,
                client: booking.client,
                phone: booking.phone,
                event: booking.event,
                package: booking.package_name,
            })
            .from(booking)
            .where(
                and(
                    gte(booking.date, start),
                    lte(booking.date, end),
                    eq(booking.status, BOOKING_STATUS_ACTIVE),
                    eq(booking.resource_reminder_sent, false)
                )
            )

        if (rows.length === 0) {
            console.log("[ResourceReminder] Nothing to send.")
            return
        }

        await processBatch(rows, async (bk) => {
            const result = await sendTemplateMessage(
                bk.phone,
                "resource_addons_v1", // TODO: your approved template name
                "en",
                [bk.client, bk.event]
            )
            if (result.success) {
                await db.update(booking)
                    .set({ resource_reminder_sent: true })
                    .where(eq(booking.id, bk.bookingId))
            }
            return result
        }, "ResourceReminder")

    } catch (error) {
        console.error("[ResourceReminder] Job-level error:", error)
    }
}

// SCHEDULER (registered once at module load) 
function startReminderJobs() {
    cron.schedule("0 9 * * *", async () => {
        console.log("=== Running daily reminder jobs (9AM PKT) ===")
        await sendBookingReminders()
        await sendAdvanceDueReminders()
        await sendResourceReminders()
        console.log("=== Daily reminder jobs complete ===")
    })
    console.log("Reminder cron jobs scheduled.")
}

module.exports = {
    startReminderJobs,
    sendBookingReminders,
    sendAdvanceDueReminders,
    sendResourceReminders,
}