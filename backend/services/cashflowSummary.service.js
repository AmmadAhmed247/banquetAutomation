const { createCanvas } = require("canvas");
const { uploadBuffer } = require("../utils/uploadToImagekit");
const { sendCashflowSummaryTemplate } = require("../services/meta.service."); // Imported here
const { computeCashflowSummary } = require("./cashflow.service");
const { db } = require("../config/db");
const { booking } = require("../model/schema");
const { and, gte, lte, eq } = require("drizzle-orm");

function currency(n) {
  return "Rs " + Number(n || 0).toLocaleString("en-PK");
}

/**
 * Renders a single booking card directly on the canvas context.
 */
function renderBookingCard(ctx, b, x, y, width) {
  const cardPadding = 16;
  const labelColor = "#64748b";
  const valueColor = "#1e293b";
  const accentBlue = "#2563eb";
  const rowGap = 22;

  const hasAddons = Array.isArray(b.addons) && b.addons.length > 0;
  let cardHeight = 220;
  if (hasAddons) {
    cardHeight += 35 + b.addons.length * 22;
  }

  // Card background & border
  ctx.save();
  ctx.fillStyle = "#eff6ff";
  ctx.strokeStyle = "#bfdbfe";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, cardHeight, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Hall name
  ctx.save();
  ctx.font = "bold 14px Arial";
  ctx.fillStyle = accentBlue;
  ctx.textAlign = "left";
  ctx.fillText(b.hall || "Hall A", x + cardPadding, y + 26);
  ctx.restore();

  // Status badge
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

  ctx.fillStyle = "#1d4ed8";
  ctx.textAlign = "center";
  ctx.fillText(statusText, badgeX + badgeWidth / 2, badgeY + 15);
  ctx.restore();

  // Customer Name & Receipt
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

  // Key-value pairs
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
    ctx.save();
    ctx.font = "13px Arial";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "left";
    ctx.fillText(field.label, x + cardPadding, currentY);

    ctx.font = "13px Arial";
    ctx.fillStyle = valueColor;
    ctx.textAlign = "right";
    ctx.fillText(field.value, x + width - cardPadding, currentY);
    ctx.restore();

    currentY += rowGap;
  });

  // Add-ons
  if (hasAddons) {
    currentY -= 6;
    ctx.save();
    ctx.strokeStyle = accentBlue;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + cardPadding, currentY);
    ctx.lineTo(x + width - cardPadding, currentY);
    ctx.stroke();
    ctx.restore();

    currentY += 20;

    ctx.save();
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = accentBlue;
    ctx.textAlign = "left";
    ctx.fillText("ADD-ONS", x + cardPadding, currentY);
    ctx.restore();

    currentY += 18;

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
 * Generates a unified canvas image containing both Cashflow and Booking Summaries.
 */
async function generateCombinedSummaryImage({ cashflowData, todayBookings, nextDayBookings, label }) {
  const W = 700;
  const cardW = W - 80;
  const maxRows = Math.min(cashflowData.activity.length, 12);

  // Dynamic height calculation
  let contentHeight = 90;

  // 1. Cashflow section
  contentHeight += 40 + 80 + 30;
  const methodsCount = Object.keys(cashflowData.byMethod).length;
  contentHeight += (methodsCount === 0 ? 1 : methodsCount) * 20 + 30;
  contentHeight += 40;
  contentHeight += (maxRows === 0 ? 1 : maxRows) * 34 + 40;

  // 2. Today's Bookings
  contentHeight += 50;
  if (todayBookings.length === 0) {
    contentHeight += 40;
  } else {
    todayBookings.forEach((b) => {
      const addonCount = Array.isArray(b.addons) ? b.addons.length : 0;
      contentHeight += 220 + (addonCount ? 35 + addonCount * 22 : 0) + 16;
    });
  }

  // 3. Tomorrow's Bookings
  contentHeight += 50;
  if (nextDayBookings.length === 0) {
    contentHeight += 40;
  } else {
    nextDayBookings.forEach((b) => {
      const addonCount = Array.isArray(b.addons) ? b.addons.length : 0;
      contentHeight += 220 + (addonCount ? 35 + addonCount * 22 : 0) + 16;
    });
  }

  const H = Math.max(contentHeight + 40, 600);

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

  const line = (x1, y1, x2, y2, color = "#e5e7eb", w = 1) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Background
  ctx.fillStyle = "#fcfcfc";
  ctx.fillRect(0, 0, W, H);

  // Main Header Banner
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, 90);
  text("DARBAR BANQUET", W / 2, 40, { size: 24, weight: "bold", color: "#ffffff", align: "center" });
  text(`Daily Summary Report — ${label}`, W / 2, 66, { size: 14, color: "#a1a1aa", align: "center" });

  let y = 130;

  // SECTION 1: CASHFLOW SUMMARY
  text("CASHFLOW SUMMARY", 40, y, { size: 16, weight: "bold", color: "#0f172a" });
  y += 20;

  // KPI Row
  const kpiW = (W - 80) / 3;
  const kpis = [
    { label: "MONEY IN", value: currency(cashflowData.totalIn), color: "#059669" },
    { label: "MONEY OUT", value: currency(cashflowData.totalOut), color: "#e11d48" },
    { label: "NET", value: (cashflowData.net >= 0 ? "+" : "-") + currency(Math.abs(cashflowData.net)), color: cashflowData.net >= 0 ? "#0f172a" : "#e11d48" },
  ];
  kpis.forEach((k, i) => {
    const x = 40 + i * kpiW;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, kpiW - 20, 80, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    text(k.label, x + 16, y + 26, { size: 10, weight: "bold", color: "#9ca3af" });
    text(k.value, x + 16, y + 56, { size: 18, weight: "bold", color: k.color });
  });

  y += 110;

  // Money in by Method
  text("Money In by Method", 40, y, { size: 13, weight: "bold", color: "#0f172a" });
  y += 22;
  const methods = Object.entries(cashflowData.byMethod);
  if (methods.length === 0) {
    text("No inflows recorded", 40, y, { size: 12, color: "#9ca3af" });
    y += 20;
  } else {
    methods.forEach(([method, amt]) => {
      text(method, 40, y, { size: 12, color: "#374151" });
      text(currency(amt), W - 40, y, { size: 12, weight: "bold", color: "#0f172a", align: "right" });
      y += 20;
    });
  }

  // Transactions list
  y += 10;
  line(40, y, W - 40, y);
  y += 26;
  text("Recent Transactions", 40, y, { size: 13, weight: "bold", color: "#0f172a" });
  y += 22;

  if (cashflowData.activity.length === 0) {
    text("No transactions recorded for this period", 40, y, { size: 12, color: "#9ca3af" });
    y += 20;
  } else {
    cashflowData.activity.slice(0, maxRows).forEach((item) => {
      const isIn = item.flow === "IN";
      text(item.category, 40, y, { size: 12, weight: "bold", color: "#0f172a" });
      text(item.note || "", 40, y + 15, { size: 10, color: "#9ca3af" });
      text(
        (isIn ? "+" : "-") + currency(item.amount),
        W - 40,
        y + 7,
        { size: 13, weight: "bold", color: isIn ? "#059669" : "#e11d48", align: "right" }
      );
      y += 34;
    });
    if (cashflowData.activity.length > maxRows) {
      text(`+ ${cashflowData.activity.length - maxRows} more transactions — see full ledger`, 40, y, { size: 11, color: "#9ca3af" });
      y += 20;
    }
  }

  // SECTION SEPARATOR
  y += 20;
  line(40, y, W - 40, y, "#94a3b8", 2);
  y += 30;

  // SECTION 2: TODAY'S BOOKINGS
  text("TODAY'S BOOKINGS", 40, y, { size: 16, weight: "bold", color: "#0f172a" });
  y += 24;

  if (todayBookings.length === 0) {
    text("No bookings scheduled for today.", 40, y, { size: 13, color: "#64748b" });
    y += 30;
  } else {
    todayBookings.forEach((b) => {
      const h = renderBookingCard(ctx, b, 40, y, cardW);
      y += h + 16;
    });
  }

  // SECTION 3: TOMORROW'S BOOKINGS
  y += 20;
  text("TOMORROW'S BOOKINGS", 40, y, { size: 16, weight: "bold", color: "#0f172a" });
  y += 24;

  if (nextDayBookings.length === 0) {
    text("No bookings scheduled for tomorrow.", 40, y, { size: 13, color: "#64748b" });
  } else {
    nextDayBookings.forEach((b) => {
      const h = renderBookingCard(ctx, b, 40, y, cardW);
      y += h + 16;
    });
  }

  const fileName = `daily-summary-${Date.now()}.png`;
  const buffer = canvas.toBuffer("image/png");
  const uploaded = await uploadBuffer(buffer, fileName, "/daily-summaries");

  return { fileName, url: uploaded.url };
}

/**
 * Main Orchestrator Function
 */
async function sendDailySummaryReport(phone) {
  // 1. Date Range Setup
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  const endToday = new Date(startToday);
  endToday.setHours(23, 59, 59, 999);

  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const endYesterday = new Date(startYesterday);
  endYesterday.setHours(23, 59, 59, 999);

  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);

  const endTomorrow = new Date(startTomorrow);
  endTomorrow.setHours(23, 59, 59, 999);

  const label = startToday.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 2. Fetch Cashflow Data (Yesterday)
  const cashflowData = await computeCashflowSummary(startYesterday, endYesterday, {
    startQ: startYesterday.toISOString().split("T")[0],
    endQ: endYesterday.toISOString().split("T")[0],
  });

  // 3. Fetch Bookings (Today & Tomorrow)
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

  const todayRecords = await db
    .select()
    .from(booking)
    .where(and(gte(booking.date, startToday), lte(booking.date, endToday), eq(booking.status, "Confirmed")));

  const nextDayRecords = await db
    .select()
    .from(booking)
    .where(and(gte(booking.date, startTomorrow), lte(booking.date, endTomorrow), eq(booking.status, "Confirmed")));

  const todayBookings = todayRecords.map(mapRecord);
  const nextDayBookings = nextDayRecords.map(mapRecord);

  // 4. Generate Canvas Image
  const { url } = await generateCombinedSummaryImage({
    cashflowData,
    todayBookings,
    nextDayBookings,
    label,
  });

  // 5. Format Values for Meta Template Parameters
  const moneyIn = currency(cashflowData.totalIn);
  const moneyOut = currency(cashflowData.totalOut);
  const netFormatted = (cashflowData.net >= 0 ? "+" : "-") + currency(Math.abs(cashflowData.net));

  // 6. Send via Imported WhatsApp Template API
  const templateResult = await sendCashflowSummaryTemplate(
    phone,
    url,
    label,
    moneyIn,
    moneyOut,
    netFormatted
  );

  return {
    success: templateResult.success,
    url,
    cashflow: cashflowData,
    todayCount: todayBookings.length,
    tomorrowCount: nextDayBookings.length,
    error: templateResult.error,
  };
}

module.exports = {
  generateCombinedSummaryImage,
  sendDailySummaryReport,
};