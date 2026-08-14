const { createCanvas } = require("canvas");
const { uploadBuffer } = require("../utils/uploadToImagekit");
const { sendMediaMessage } = require("./meta.service.");
const { computeCashflowSummary } = require("./cashflow.service");

function currency(n) {
  return "Rs " + Number(n || 0).toLocaleString("en-PK");
}

async function generateCashflowSummaryImage(startDate, endDate, label) {
  const data = await computeCashflowSummary(startDate, endDate, {
    startQ: startDate.toISOString().split("T")[0],
    endQ: endDate.toISOString().split("T")[0],
  });

  const W = 700;
  const rowHeight = 34;
  const maxRows = Math.min(data.activity.length, 12); // keep the image a reasonable length
  const H = 340 + maxRows * rowHeight + 60;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const text = (str, x, y, { size = 14, weight = "normal", color = "#111", align = "left", font = "Arial" } = {}) => {
    ctx.save();
    ctx.font = `${weight} ${size}px ${font}`;
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

  // Header band
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, 90);
  text("DARBAR BANQUET", W / 2, 40, { size: 24, weight: "bold", color: "#ffffff", align: "center" });
  text(`Cashflow Summary — ${label}`, W / 2, 66, { size: 14, color: "#a1a1aa", align: "center" });

  // KPI row
  const kpiY = 130;
  const kpiW = (W - 80) / 3;
  const kpis = [
    { label: "MONEY IN", value: currency(data.totalIn), color: "#059669" },
    { label: "MONEY OUT", value: currency(data.totalOut), color: "#e11d48" },
    { label: "NET", value: (data.net >= 0 ? "+" : "-") + currency(Math.abs(data.net)), color: data.net >= 0 ? "#0f172a" : "#e11d48" },
  ];
  kpis.forEach((k, i) => {
    const x = 40 + i * kpiW;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, kpiY, kpiW - 20, 80, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    text(k.label, x + 16, kpiY + 26, { size: 10, weight: "bold", color: "#9ca3af" });
    text(k.value, x + 16, kpiY + 56, { size: 18, weight: "bold", color: k.color });
  });

  // Payment method breakdown
  let y = kpiY + 110;
  text("Money In by Method", 40, y, { size: 13, weight: "bold", color: "#0f172a" });
  y += 22;
  const methods = Object.entries(data.byMethod);
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

  // Activity list
  y += 20;
  line(40, y, W - 40, y);
  y += 26;
  text("Activity", 40, y, { size: 13, weight: "bold", color: "#0f172a" });
  y += 22;

  if (data.activity.length === 0) {
    text("No transactions recorded for this period", 40, y, { size: 12, color: "#9ca3af" });
  } else {
    data.activity.slice(0, maxRows).forEach((item) => {
      const isIn = item.flow === "IN";
      text(item.category, 40, y, { size: 12, weight: "bold", color: "#0f172a" });
      text(item.note || "", 40, y + 15, { size: 10, color: "#9ca3af" });
      text(
        (isIn ? "+" : "-") + currency(item.amount),
        W - 40,
        y + 7,
        { size: 13, weight: "bold", color: isIn ? "#059669" : "#e11d48", align: "right" }
      );
      y += rowHeight;
    });
    if (data.activity.length > maxRows) {
      text(`+ ${data.activity.length - maxRows} more transactions — see full ledger`, 40, y, { size: 11, color: "#9ca3af" });
    }
  }

  const fileName = `cashflow-summary-${Date.now()}.png`;
  const buffer = canvas.toBuffer("image/png");
  const uploaded = await uploadBuffer(buffer, fileName, "/cashflow-summaries");

  return { fileName, url: uploaded.url, data };
}

async function sendDailyCashflowSummary(phone) {
  const start = new Date();
  start.setDate(start.getDate() - 1); // yesterday's full day
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const label = start.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  const { url, data } = await generateCashflowSummaryImage(start, end, label);

  console.log("Generated image URL:", url);

  console.log("Owner Phone: ", phone)

 await sendMediaMessage(
    phone,
    `Cashflow Summary — ${label}\n\nMoney In: ${currency(data.totalIn)}\nMoney Out: ${currency(data.totalOut)}\nNet: ${data.net >= 0 ? "+" : "-"}${currency(Math.abs(data.net))}`,
    url
  );


  return { url, data };
}

module.exports = { generateCashflowSummaryImage, sendDailyCashflowSummary };