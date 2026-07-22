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

    // Force strict UTC start/end boundaries for database queries
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Only need booked dates from bookings table
    const booked = await db
        .select({ date: booking.date })
        .from(booking)
        .where(and(gte(booking.date, start), lte(booking.date, end)));

    // Safely extract day of month in UTC
    const bookedDays = booked
        .map(b => b?.date)
        .filter(Boolean)
        .map(d => {
            const dateObj = typeof d === "string" ? new Date(d) : d;
            return dateObj.getUTCDate(); // Ensure UTC extraction
        });

    const canvas = createCanvas(600, 500);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 500);

    // Header (Use UTC for string formatting to prevent shifts)
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, 600, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    
    // Formatter forced to UTC
    const monthName = start.toLocaleString("default", { month: "long", timeZone: "UTC" });
    ctx.fillText(`${monthName} ${year}`, 300, 45);

    // Day headers
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial";
        ctx.fillText(d, 50 + i * 80, 100);
    });

    // Dates - calculate day-of-week using UTC
    const firstDay = start.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let row = 0;

    for (let day = 1; day <= daysInMonth; day++) {
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