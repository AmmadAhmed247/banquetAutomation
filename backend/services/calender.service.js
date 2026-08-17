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
 
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
 
    const booked = await db
        .select({ date: booking.date, time_slot: booking.time_slot })
        .from(booking)
        .where(
            and(
                gte(booking.date, start),
                lte(booking.date, end),
                eq(booking.venue, hall),
                eq(booking.status, "Confirmed")
            )
        );
 
    const bookedSlots = {};
    booked.forEach((b) => {
        if (!b?.date) return;
        const dateObj = typeof b.date === "string" ? new Date(b.date) : b.date;
        const day = dateObj.getUTCDate();
        const slot = b.time_slot === "Day" ? "Day" : "Night";
 
        if (!bookedSlots[day]) bookedSlots[day] = { Day: false, Night: false };
        bookedSlots[day][slot] = true;
    });
 
    const hallColor = hall === "Hall B" ? "#e51a28" : "#3b82f6";
    const dayColor = hall === "Hall B" ? "#ef5354" : "#60a5fa"; // darker tint, closer to nightColor
    const nightColor = hallColor;
    const headerColor = "#10b981";
    const availableColor = "#f1f5f9";
 
    const radius = 28;
    const colStep = 80;
    const rowHeight = 92;
    const gridStartX = 50;
    const gridStartY = 150;
 
    const firstDay = start.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalRows = Math.ceil((firstDay + daysInMonth) / 7);
 
    // Canvas height now grows with the number of calendar rows, so months
    // with 6 rows don't overlap or clip the legend like a fixed height would.
    const legendY = gridStartY + totalRows * rowHeight - (rowHeight - radius * 2) + 40;
    const H = legendY + 40;
    const W = 600;
 
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
 
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
 
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, W, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
 
    const monthName = start.toLocaleString("default", { month: "long" });
    ctx.fillText(`${hall} — ${monthName} ${year}`, W / 2, 45);
 
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d, i) => {
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 14px Arial";
        ctx.fillText(d, gridStartX + i * colStep, 105);
    });
 
    // Draws one date circle split top (Day) / bottom (Night), each half
    // labeled and colored independently.
    function drawSplitCircle(x, y, r, daySlot, nightSlot) {
        const dayFill = daySlot ? dayColor : availableColor;
        const nightFill = nightSlot ? nightColor : availableColor;
 
        // Top half — Day (180° to 360°)
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = dayFill;
        ctx.fill();
 
        // Bottom half — Night (0° to 180°)
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, 0, Math.PI);
        ctx.closePath();
        ctx.fillStyle = nightFill;
        ctx.fill();
 
        // Horizontal divider
        ctx.beginPath();
        ctx.moveTo(x - r, y);
        ctx.lineTo(x + r, y);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
 
        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.stroke();
 
        ctx.font = "bold 7px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = daySlot ? "#ffffff" : "#94a3b8";
        ctx.fillText("DAY", x, y - r * 0.45);
 
        ctx.fillStyle = nightSlot ? "#ffffff" : "#94a3b8";
        ctx.fillText("NIGHT", x, y + r * 0.65);
    }
 
    let row = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const col = (firstDay + day - 1) % 7;
        if (day > 1 && col === 0) row++;
 
        const x = gridStartX + col * colStep;
        const y = gridStartY + row * rowHeight;
        const slots = bookedSlots[day] || { Day: false, Night: false };
 
        drawSplitCircle(x, y, radius, slots.Day, slots.Night);
 
        // White chip behind the day number so it's readable against either half's color
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();
 
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText(day, x, y + 4);
    }
 
    const legendItems = [
        { color: dayColor, label: "Day Booked" },
        { color: nightColor, label: "Night Booked" },
        { color: availableColor, label: "Available" },
    ];
 
    let legendX = 90;
    legendItems.forEach((item) => {
        ctx.beginPath();
        ctx.arc(legendX, legendY, 9, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.stroke();
 
        ctx.fillStyle = "#64748b";
        ctx.font = "13px Arial";
        ctx.textAlign = "left";
        ctx.fillText(item.label, legendX + 16, legendY + 5);
 
        legendX += ctx.measureText(item.label).width + 60;
    });
 
    const fileName = `calendar-${hall.replace(/\s+/g, '')}-${year}-${month}-${Date.now()}.png`;
    const buffer = canvas.toBuffer("image/png");
    const uploaded = await uploadBuffer(buffer, fileName, "/calendars");

    return { fileName, url: uploaded.url, fileId: uploaded.fileId };
}
 

module.exports = { generateCalendarImage };