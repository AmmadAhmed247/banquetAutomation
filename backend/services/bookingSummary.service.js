const { createCanvas } = require("canvas");
const { uploadBuffer } = require("../utils/uploadToImagekit");
const { sendMediaMessage } = require("./meta.service.");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { and, gte, lte, eq } = require("drizzle-orm");

function currency(n) {
  return "PKR " + Number(n || 0).toLocaleString("en-PK");
}

/**
 * Renders a single event card adhering to the target card UI design.
 */
function renderBookingCard(ctx, b, x, y, width) {
  const cardPadding = 16;
  const labelColor = "#64748b";
  const valueColor = "#1e293b";
  const accentBlue = "#2563eb";
  const rowGap = 22;

  // 1. Calculate card height dynamically (with optional add-ons section)
  const hasAddons = Array.isArray(b.addons) && b.addons.length > 0;
  let cardHeight = 220;
  if (hasAddons) {
    cardHeight += 35 + b.addons.length * 22;
  }

  // 2. Draw Card Background & Rounded Border
  ctx.save();
  ctx.fillStyle = "#eff6ff"; // Light blue background tint
  ctx.strokeStyle = "#bfdbfe"; // Soft blue border
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, cardHeight, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Hall Name (Top Left)
  ctx.save();
  ctx.font = "bold 14px Arial";
  ctx.fillStyle = accentBlue;
  ctx.textAlign = "left";
  ctx.fillText(b.hall || "Hall A", x + cardPadding, y + 26);
  ctx.restore();

  // 4. Status Badge (Top Right)
  const statusText = (b.status || "CONFIRMED").toUpperCase();
  ctx.save();
  ctx.font = "bold 11px Arial";
  ctx.fillStyle = "#bfdbfe";
  const badgeWidth = ctx.measureText(statusText).width + 18;
  const badgeHeight = 22;
  const badgeX = x + width - cardPadding - badgeWidth;
  const badgeY = y + 12;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
  ctx.fill();

  ctx.fillStyle = "#1d4ed8"; // Dark blue text
  ctx.textAlign = "center";
  ctx.fillText(statusText, badgeX + badgeWidth / 2, badgeY + 15);
  ctx.restore();

  // 5. Customer Name & Receipt No.
  ctx.save();
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(b.name || "Customer", x + cardPadding, y + 52);

  ctx.font = "13px Arial";
  ctx.fillStyle = labelColor;
  ctx.fillText(`R.No: `, x + cardPadding, y + 70);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 13px Arial";
  ctx.fillText(`${b.receiptNo || "N/A"}`, x + cardPadding + 42, y + 70);
  ctx.restore();

  // 6. Data Key-Value Fields
  const fields = [
    { label: "Phone:", value: b.phone || "-" },
    { label: "Guests:", value: String(b.guests || 0) },
    { label: "Total:", value: currency(b.totalAmount) },
    { label: "Advance:", value: currency(b.advanceAmount) },
    { label: "Time Slot:", value: b.timeSlot || "Night" },
    { label: "Method:", value: b.paymentMethod || "Cash" },
  ];

  let currentY = y + 92;
  fields.forEach((field) => {
    // Label on left
    ctx.save();
    ctx.font = "13px Arial";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "left";
    ctx.fillText(field.label, x + cardPadding, currentY);

    // Value on right
    ctx.font = "13px Arial";
    ctx.fillStyle = valueColor;
    ctx.textAlign = "right";
    ctx.fillText(field.value, x + width - cardPadding, currentY);
    ctx.restore();

    currentY += rowGap;
  });

  // 7. Add-ons Section (if applicable)
  if (hasAddons) {
    currentY -= 6;
    // Section divider line
    ctx.save();
    ctx.strokeStyle = accentBlue;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + cardPadding, currentY);
    ctx.lineTo(x + width - cardPadding, currentY);
    ctx.stroke();
    ctx.restore();

    currentY += 20;

    // Add-ons header label
    ctx.save();
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = accentBlue;
    ctx.textAlign = "left";
    ctx.fillText("ADD-ONS", x + cardPadding, currentY);
    ctx.restore();

    currentY += 18;

    // Render each add-on entry
    b.addons.forEach((addon) => {
      ctx.save();
      ctx.font = "13px Arial";
      ctx.fillStyle = labelColor;
      ctx.textAlign = "left";
      ctx.fillText(addon.name, x + cardPadding, currentY);

      ctx.fillStyle = valueColor;
      ctx.textAlign = "right";
      ctx.fillText(currency(addon.price), x + width - cardPadding, currentY);
      ctx.restore();

      currentY += 20;
    });
  }

  return cardHeight;
}

/**
 * Generates an image featuring today's bookings and upcoming events.
 */
async function generateBookingSummaryImage(todayBookings = [], upcomingBookings = [], label = "") {
  const W = 700;
  const cardW = W - 80;

  // Calculate dynamic canvas height
  let contentHeight = 120; // Header spacing

  // Section 1: Today's Bookings
  contentHeight += 40; // Section title height
  if (todayBookings.length === 0) {
    contentHeight += 40;
  } else {
    todayBookings.forEach((b) => {
      const addonCount = Array.isArray(b.addons) ? b.addons.length : 0;
      contentHeight += 220 + (addonCount ? 35 + addonCount * 22 : 0) + 16;
    });
  }

  // Section 2: Upcoming Events
  contentHeight += 40; // Section title height
  if (upcomingBookings.length === 0) {
    contentHeight += 40;
  } else {
    upcomingBookings.forEach((b) => {
      const addonCount = Array.isArray(b.addons) ? b.addons.length : 0;
      contentHeight += 220 + (addonCount ? 35 + addonCount * 22 : 0) + 16;
    });
  }

  const H = Math.max(contentHeight + 40, 400);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const text = (str, x, y, { size = 14, weight = "normal", color = "#111", align = "left" } = {}) => {
    ctx.save();
    ctx.font = `${weight} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  };

  // Canvas background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, W, H);

  // Top header banner
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, 90);
  text("DARBAR BANQUET", W / 2, 40, { size: 24, weight: "bold", color: "#ffffff", align: "center" });
  text(`Booking & Event Summary — ${label}`, W / 2, 66, { size: 14, color: "#94a3b8", align: "center" });

  let y = 120;

  // Render Section 1: Today's Bookings
  text("TODAY'S BOOKINGS", 40, y, { size: 14, weight: "bold", color: "#0f172a" });
  y += 18;

  if (todayBookings.length === 0) {
    text("No bookings scheduled for today.", 40, y + 16, { size: 13, color: "#64748b" });
    y += 40;
  } else {
    todayBookings.forEach((b) => {
      const h = renderBookingCard(ctx, b, 40, y, cardW);
      y += h + 16;
    });
  }

  // Render Section 2: Upcoming Events
  y += 10;
  text("UPCOMING EVENTS", 40, y, { size: 14, weight: "bold", color: "#0f172a" });
  y += 18;

  if (upcomingBookings.length === 0) {
    text("No upcoming events recorded.", 40, y + 16, { size: 13, color: "#64748b" });
  } else {
    upcomingBookings.forEach((b) => {
      const h = renderBookingCard(ctx, b, 40, y, cardW);
      y += h + 16;
    });
  }

  const fileName = `booking-summary-${Date.now()}.png`;
  const buffer = canvas.toBuffer("image/png");
  const uploaded = await uploadBuffer(buffer, fileName, "/booking-summaries");

  return { fileName, url: uploaded.url };
}

/**
 * Fetches today's and upcoming events from DB and sends the summary card to WhatsApp.
 */
async function sendDailyBookingSummary(phone) {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  const endToday = new Date(startToday);
  endToday.setHours(23, 59, 59, 999);

  // Query today's bookings
  const todayRecords = await db
    .select()
    .from(booking)
    .where(
      and(
        gte(booking.date, startToday),
        lte(booking.date, endToday),
        eq(booking.status, "Confirmed")
      )
    );

  // Query upcoming bookings (next 7 days starting tomorrow)
  const startUpcoming = new Date(endToday);
  const endUpcoming = new Date(startUpcoming);
  endUpcoming.setDate(endUpcoming.getDate() + 7);

  const upcomingRecords = await db
    .select()
    .from(booking)
    .where(
      and(
        gte(booking.date, startUpcoming),
        lte(booking.date, endUpcoming),
        eq(booking.status, "Confirmed")
      )
    );

  const label = startToday.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Map DB schema records to card format
  const mapRecord = (rec) => ({
    hall: rec.venue || rec.hall,
    status: rec.status,
    name: rec.customerName || rec.name,
    receiptNo: rec.receiptNo || rec.id,
    phone: rec.phone,
    guests: rec.guests,
    totalAmount: rec.totalAmount || rec.total,
    advanceAmount: rec.advanceAmount || rec.advance || 0,
    timeSlot: rec.timeSlot,
    paymentMethod: rec.paymentMethod || rec.method,
    addons: rec.addons || [],
  });

  const todayBookings = todayRecords.map(mapRecord);
  const upcomingBookings = upcomingRecords.map(mapRecord);

  const { url } = await generateBookingSummaryImage(todayBookings, upcomingBookings, label);

  const caption = `📋 *Daily Booking & Event Summary*\n📅 ${label}\n\n• *Today's Bookings:* ${todayBookings.length}\n• *Upcoming (Next 7 Days):* ${upcomingBookings.length}`;

  await sendMediaMessage(phone, caption, url);

  return { url, todayCount: todayBookings.length, upcomingCount: upcomingBookings.length };
}

module.exports = { generateBookingSummaryImage, sendDailyBookingSummary };