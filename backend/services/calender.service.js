const { createCanvas } = require("canvas");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { and, gte, lte } = require("drizzle-orm");
const fs = require("fs");
const path = require("path");

async function generateCalendarImage(year, month) {
    if (!year || !month) {
        throw new Error(`Invalid inputs: year=${year}, month=${month}`);
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    // Only need booked dates from bookings table
    const booked = await db
        .select({ date: booking.date })
        .from(booking)
        .where(and(gte(booking.date, start), lte(booking.date, end)));

    const bookedDays = booked
        .map(b => b?.date)
        .filter(Boolean)
        .map(d => d.getDate());


    const canvas = createCanvas(600, 500);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 500);

    // Header
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, 600, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${start.toLocaleString("default", { month: "long" })} ${year}`, 300, 45);

    // Day headers
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial";
        ctx.fillText(d, 50 + i * 80, 100);
    });

    // Dates
    const firstDay = start.getDay();
    let row = 0;

    for (let day = 1; day <= end.getDate(); day++) {
        const col = (firstDay + day - 1) % 7;
        if (day > 1 && col === 0) row++;

        const x = 50 + col * 80;
        const y = 140 + row * 70;
        const isBooked = bookedDays.includes(day);

        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = isBooked ? "#ef4444" : "#f1f5f9";
        ctx.fill();

        ctx.fillStyle = isBooked ? "#ffffff" : "#1e293b";
        ctx.font = "bold 16px Arial";
        ctx.fillText(day, x, y + 6);
    }

    // Legend
    ctx.beginPath();
    ctx.arc(220, 460, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Booked", 238, 465);

    ctx.beginPath();
    ctx.arc(340, 460, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#f1f5f9";
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillText("Available", 358, 465);

    const outputPath = path.join(__dirname, "../public/calendar.png");
    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

    return outputPath;
}

module.exports = { generateCalendarImage };