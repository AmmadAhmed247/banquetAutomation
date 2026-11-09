const { createCanvas } = require("canvas");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { and, gte, lte, eq, inArray } = require("drizzle-orm");
const { uploadBuffer } = require("../utils/uploadToImagekit");

async function generateCalendarImage(year, month, hall) {
    if (!year || !month || !hall) {
        throw new Error(`Invalid inputs: year=${year}, month=${month}, hall=${hall}`);
    }

    const karachiOffsetMs = 5 * 60 * 60 * 1000;
    const calendarStart = new Date(Date.UTC(year, month - 1, 1));
    const queryStart = new Date(calendarStart.getTime() - karachiOffsetMs);
    const queryEnd = new Date(Date.UTC(year, month, 1) - karachiOffsetMs - 1);

    const booked = await db
        .select({ date: booking.date, status: booking.status })
        .from(booking)
        .where(
            and(
                gte(booking.date, queryStart),
                lte(booking.date, queryEnd),
                eq(booking.venue, hall),
                inArray(booking.status, ["Confirmed", "Pending", "Finished"])
            )
        );

    const bookedDays = new Set();
    for (const { date, status } of booked) {
        if (!date) continue;
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const day = new Date(dateObj.getTime() + karachiOffsetMs).getUTCDate();
        bookedDays.add(day);
    }

    const bookedColor = hall === "Hall B" ? "#e51a28" : "#3b82f6"; 
    const headerColor = "#10b981";
    const canvasWidth = 600;
    const canvasHeight = 540;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, 600, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    // Format month using explicit UTC timezone
    const monthName = calendarStart.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    ctx.fillText(`${hall} — ${monthName} ${year}`, 300, 45);

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial";
        ctx.fillText(d, 50 + i * 80, 100);
    });

    // Fix: Use UTC day positioning to match UTC date bounds
    const firstDay = calendarStart.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let row = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const col = (firstDay + day - 1) % 7;
        if (day > 1 && col === 0) row++;

        const x = 50 + col * 80;
        const y = 140 + row * 55;
        const isBooked = bookedDays.has(day);
        ctx.fillStyle = isBooked ? bookedColor : "#f1f5f9";
        ctx.fillRect(x - 30, y - 22, 60, 44);

        ctx.fillStyle = isBooked ? "#ffffff" : "#1e293b";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(day, x, y + 6);
    }

    // Legend
    ctx.fillStyle = bookedColor;
    ctx.fillRect(130, 490, 20, 20);
    ctx.fillStyle = "#64748b";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Booked", 158, 505);

    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(400, 490, 20, 20);
    ctx.fillStyle = "#64748b";
    ctx.fillText("Available", 428, 505);

    const fileName = `calendar-${hall.replace(/\s+/g, '')}-${year}-${month}-${Date.now()}.png`;
    const buffer = canvas.toBuffer("image/png");
    const uploaded = await uploadBuffer(buffer, fileName, "/calendars");
    return { fileName, url: uploaded.url, fileId: uploaded.fileId };
}

module.exports = { generateCalendarImage };