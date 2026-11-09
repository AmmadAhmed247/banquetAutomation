const {
    BUSINESS,
    HALLS,
    getBookedDates,
    getPriceForDate,
    getMonthPricing,
    getCalendarData,
} = require("./Agentdata.service");
const { sendMediaMessage } = require("./meta.service.");
const { flagContact, logMessage } = require("./Inbox.service");

const hallProp = { type: "string", enum: Object.keys(HALLS) };

const toolDefinitions = [
    {
        name: "check_availability",
        description:
            "Get booked dates of one hall between two dates (max 62 days). Pending, Confirmed, and Finished dates are booked; dates not listed are free. ALWAYS send the full calendar for the month containing the requested date range's start, even for a single-date availability question.",
        input_schema: {
            type: "object",
            properties: {
                hall: hallProp,
                from: { type: "string", description: "YYYY-MM-DD" },
                to: { type: "string", description: "YYYY-MM-DD" },
            },
            required: ["hall", "from", "to"],
        },
    },
    {
        name: "get_pricing",
        description:
            "Get the starting-from hall price in PKR for one date, or all price ranges in a month. estimated=true means the price is only approximate.",
        input_schema: {
            type: "object",
            properties: {
                hall: hallProp,
                date: { type: "string", description: "YYYY-MM-DD" },
                month: { type: "string", description: "YYYY-MM, use when no exact date is known" },
            },
            required: ["hall"],
        },
    },
    {
        name: "get_hall_info",
        description: "Get capacity of each hall and the venue address.",
        input_schema: { type: "object", properties: {} },
    },
    {
        name: "send_calendar_image",
        description:
            "Send the full-month availability calendar image. ALWAYS call this when the customer asks if any specific date is free or asks about availability for a month. Use the same hall and month as the date they asked about, even if they only asked about one date. Do not use for pricing-only questions.",
        input_schema: {
            type: "object",
            properties: { hall: hallProp, month: { type: "string", description: "YYYY-MM" } },
            required: ["hall", "month"],
        },
    },
    {
        name: "handoff_to_human",
        description:
            "Pass the chat to staff. Use for booking requests, discounts, complaints, or when you cannot answer.",
        input_schema: { type: "object", properties: { reason: { type: "string" } }, required: ["reason"] },
    },
];

const needHall = (hall) => {
    if (!HALLS[hall]) throw new Error(`Unknown hall: ${hall}`);
};
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "");
const isMonth = (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s ?? "");

async function sendCalendarImage(hall, month, contact) {
    const { url } = await getCalendarData(hall, month);
    const [year, monthNumber] = month.split("-").map(Number);
    const monthName = new Date(Date.UTC(year, monthNumber - 1, 1))
        .toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    const caption = `${hall} — ${monthName} ${year}\nFilled = booked`;
    const result = await sendMediaMessage(contact.phone, caption, url);
    if (!result?.success) throw new Error("Could not send the calendar image");
    await logMessage({
        conversationId: contact.id,
        wa_message_id: result.messageId ?? null,
        direction: "out",
        sender: "bot",
        type: "image",
        body: caption,
    });
    return result;
}

const toolHandlers = {
    async check_availability({ hall, from, to }, { contact }) {
        needHall(hall);
        if (!isDate(from) || !isDate(to)) throw new Error("Dates must be YYYY-MM-DD");
        if ((new Date(to) - new Date(from)) / 864e5 > 62) throw new Error("Range too long, max 62 days");
        const booked = await getBookedDates(hall, from, to);
        const calendar = await sendCalendarImage(hall, from.slice(0, 7), contact);
        return { hall, from, to, booked, calendar_sent: true };
    },

    async get_pricing({ hall, date, month }) {
        needHall(hall);
        if (date) {
            if (!isDate(date)) throw new Error("Date must be YYYY-MM-DD");
            const p = getPriceForDate(hall, date);
            if (!p) throw new Error("No pricing for that date, hand off to staff");
            return { hall, date, ...p };
        }
        if (isMonth(month)) {
            const ranges = getMonthPricing(hall, Number(month.slice(5)));
            if (!ranges.length) throw new Error("No pricing for that month, hand off to staff");
            return { hall, month, ranges };
        }
        throw new Error("Provide a date (YYYY-MM-DD) or a month (YYYY-MM)");
    },

    async get_hall_info() {
        return { halls: HALLS, address: BUSINESS.address };
    },

    async send_calendar_image({ hall, month }, { contact }) {
        needHall(hall);
        if (!isMonth(month)) throw new Error("Month must be YYYY-MM");
        const calendar = await sendCalendarImage(hall, month, contact);
        const [y, m] = month.split("-").map(Number);
        const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
        const booked = await getBookedDates(hall, `${month}-01`, last);
        return {
            sent: true,
            hall,
            month,
            booked_days: [...new Set(booked.map(({ date }) => Number(date.slice(-2))))].sort((a, b) => a - b),
        };
    },

    async handoff_to_human({ reason }, { contact }) {
        await flagContact(contact.id, reason, true);
        return { ok: true };
    },
};

module.exports = { toolDefinitions, toolHandlers };