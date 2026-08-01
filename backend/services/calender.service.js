const { createCanvas } = require("canvas");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { and, gte, lte, eq }  = require("drizzle-orm");
const fs = require("fs");
const path = require("path");
const { uploadBuffer } = require("../utils/uploadToImagekit");
async function generateCalendarImage(year, month, hall) {
    if (!year || !month || !hall) {
        throw new Error(`Invalid inputs: year=${year}, month=${month}, hall=${hall}`);
    }

    // Use local time for layout rendering to match user expectation
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const booked = await db
        .select({ date: booking.date })
        .from(booking)
        .where(
            and(
                gte(booking.date, start),
                lte(booking.date, end),
                eq(booking.venue, hall),
                eq(booking.status, "Confirmed")
            )
        );

    const bookedDays = booked
    .map(b => b?.date)
    .filter(Boolean)
    .map(d => {
        const dateObj = typeof d === "string" ? new Date(d) : d;
        return dateObj.getUTCDate();
    });

    // Hall-specific booked color
    const bookedColor = hall === "Hall B" ? "#3b82f6" : "#ef4444"; 
    const headerColor = "#10b981";

    const canvas = createCanvas(600, 500);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 500);

    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, 600, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    // Use local month name formatting
    const monthName = start.toLocaleString("default", { month: "long" });
    ctx.fillText(`${hall} — ${monthName} ${year}`, 300, 45);

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial";
        ctx.fillText(d, 50 + i * 80, 100);
    });

    // Use local day mapping (getDay instead of getUTCDay)
    const firstDay = start.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    let row = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const col = (firstDay + day - 1) % 7;
        if (day > 1 && col === 0) row++;

        const x = 50 + col * 80;
        const y = 140 + row * 70;
        const isBooked = bookedDays.includes(day);

        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = isBooked ? bookedColor : "#f1f5f9";
        ctx.fill();

        ctx.fillStyle = isBooked ? "#ffffff" : "#1e293b";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(day, x, y + 6);
    }

    ctx.beginPath();
    ctx.arc(220, 460, 10, 0, Math.PI * 2);
    ctx.fillStyle = bookedColor;
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

     const fileName = `calendar-${hall.replace(/\s+/g, '')}-${year}-${month}-${Date.now()}.png`;
     const buffer = canvas.toBuffer("image/png");
    const uploaded = await uploadBuffer(buffer, fileName, "/calendars");
     return { fileName, url: uploaded.url, fileId: uploaded.fileId };
}


module.exports = { generateCalendarImage };