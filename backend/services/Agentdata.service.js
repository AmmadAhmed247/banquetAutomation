// Adapter between the agent and your real data: bookings, pricing, calendar image.
const { and, gte, lte, eq, inArray } = require("drizzle-orm");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { generateCalendarImage } = require("./calender.service");
const { PRICING } = require("./message.service"); 

const BUSINESS = {
    name: "Darbar Banquet",
    address: "D-16, Block N, North Nazimabad Town, Karachi",
};

const HALLS = {
    "Hall A": { capacity: 600 },
    "Hall B": { capacity: 200 },
};

/** Booked dates for a hall. Pending, Confirmed, and Finished bookings all occupy the date. */
async function getBookedDates(hall, from, to) {
    const karachiOffsetMs = 5 * 60 * 60 * 1000;
    const rows = await db
        .select({ date: booking.date, status: booking.status, time_slot: booking.time_slot })
        .from(booking)
        .where(
            and(
                eq(booking.venue, hall),
                inArray(booking.status, ["Confirmed", "Pending", "Finished"]),
                gte(booking.date, new Date(new Date(`${from}T00:00:00.000Z`).getTime() - karachiOffsetMs)),
                lte(booking.date, new Date(new Date(`${to}T23:59:59.999Z`).getTime() - karachiOffsetMs))
            )
        );
    return rows
        .map((r) => ({
            date: new Date(new Date(r.date).getTime() + karachiOffsetMs).toISOString().slice(0, 10),
            status: r.status,
            time_slot: r.time_slot,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

const rangeOut = (r) =>
    r.price != null
        ? { price_pkr: r.price, estimated: false }
        : { price_min_pkr: r.priceMin, price_max_pkr: r.priceMax, estimated: true };

/** Starting-from price for one date ("YYYY-MM-DD"). */
function getPriceForDate(hall, dateStr) {
    const [, m, d] = dateStr.split("-").map(Number);
    const range = (PRICING[hall]?.[m] ?? []).find((r) => d >= r.start && d <= r.end);
    return range ? rangeOut(range) : null;
}

/** All price ranges inside a month. */
function getMonthPricing(hall, month) {
    return (PRICING[hall]?.[month] ?? []).map((r) => ({ from_day: r.start, to_day: r.end, ...rangeOut(r) }));
}

/** Generates the calendar PNG with your existing generator and returns its hosted URL. */
async function getCalendarUrl(hall, month) {
    const { url } = await getCalendarData(hall, month);
    return url;
}

async function getCalendarData(hall, month) {
    const [y, m] = month.split("-").map(Number);
    return generateCalendarImage(y, m, hall);
}

module.exports = { BUSINESS, HALLS, getBookedDates, getPriceForDate, getMonthPricing, getCalendarUrl, getCalendarData };