const PDFDocument = require("pdfkit");

const fmt = (n) =>
  "Rs " + Number(n || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });

const fmtDate = (d) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

/**
 * Writes a cashflow PDF into `stream` (res, file stream, etc).
 * @param {import("stream").Writable} stream
 * @param {object} summary  result of computeCashflowSummary()
 * @param {{title:string, fromLabel:string, toLabel:string}} meta
 */
function generateCashflowPdf(stream, summary, { title, fromLabel, toLabel }) {
  const s = summary;
  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
  doc.pipe(stream);

  const left = 40;
  const width = doc.page.width - 80;

  const ensureSpace = (h = 40) => {
    if (doc.y + h > doc.page.height - 50) doc.addPage();
  };

  // ── Header ──
  doc.font("Helvetica-Bold").fontSize(18).fillColor("#000").text(title, left);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#666")
    .text(`Period: ${fromLabel} to ${toLabel}`)
    .text(`Generated: ${fmtDate(new Date())}`);
  doc.fillColor("#000").moveDown();

  // ── Key/value section ──
  const section = (heading, rows) => {
    if (!rows.length) return;
    ensureSpace(30 + rows.length * 18);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#000").text(heading, left);
    doc
      .moveTo(left, doc.y + 2)
      .lineTo(left + width, doc.y + 2)
      .strokeColor("#ccc")
      .stroke();
    doc.moveDown(0.5);

    rows.forEach(([k, v, bold]) => {
      const y = doc.y;
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .fillColor("#000")
        .text(k, left, y, { width: width * 0.6 })
        .text(v, left + width * 0.6, y, { width: width * 0.4, align: "right" });
      doc.moveDown(0.3);
    });
    doc.moveDown();
  };

  section("Profit Summary", [
    ["Gross Revenue", fmt(s.grossRevenue)],
    ["Total Costs", fmt(s.totalCosts)],
    ["Net Profit", fmt(s.netProfit), true],
    ["Add-on Commission", fmt(s.addonCommission)],
  ]);

  section("Cashflow", [
    ["Total In", fmt(s.totalIn)],
    ["Total Out", fmt(s.totalOut)],
    ["Net", fmt(s.net), true],
    ["Cash In", fmt(s.cashIn)],
    ["Cash Out", fmt(s.cashOut)],
    ["Cash In Hand", fmt(s.cashInHand), true],
    ["Bank In", fmt(s.bankIn)],
  ]);

  section(
    "Inflow by Method",
    Object.entries(s.byMethod || {}).map(([k, v]) => [k, fmt(v)])
  );

  section("Expenses Breakdown", [
    ["Daily Expenses", fmt(s.dailyExpense)],
    ["Monthly Overhead", fmt(s.monthlyExpense)],
  ]);

  section("Beverages", [
    ["Pepsi", `${s.pepsiCrates} crates / ${fmt(s.pepsiPaid)}`],
    ["Coke", `${s.cokeCrates} crates / ${fmt(s.cokePaid)}`],
  ]);

  // ── Transactions table ──
  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#000").text("Transactions", left);
  doc.moveDown(0.5);

  const cols = [
    { label: "Date", w: 95 },
    { label: "Flow", w: 35 },
    { label: "Category", w: 90 },
    { label: "Details", w: 150 },
    { label: "Method", w: 65 },
    { label: "Amount", w: 80, align: "right" },
  ];

  const drawRow = (cells, { bold = false, bg } = {}) => {
    const y = doc.y;
    const rowH = 16;
    if (bg) doc.rect(left, y - 2, width, rowH).fill(bg);
    doc.fillColor("#000");
    let x = left;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8);
    cells.forEach((c, i) => {
      doc.text(String(c ?? ""), x + 2, y + 1, {
        width: cols[i].w - 4,
        align: cols[i].align || "left",
        lineBreak: false,
        ellipsis: true,
      });
      x += cols[i].w;
    });
    doc.y = y + rowH;
  };

  const drawHeader = () =>
    drawRow(cols.map((c) => c.label), { bold: true, bg: "#eeeeee" });

  drawHeader();

  (s.activity || []).forEach((a) => {
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
      drawHeader();
    }
    drawRow([
      fmtDate(a.time),
      a.flow,
      a.category,
      `${a.note || ""}${a.who ? ` (${a.who})` : ""}`,
      a.method,
      (a.flow === "OUT" ? "-" : "+") + fmt(a.amount),
    ]);
  });

  // ── Footer: Page X of Y ──
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#888")
      .text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 30, {
        width: doc.page.width,
        align: "center",
      });
    doc.page.margins.bottom = oldBottom;
  }

  doc.end();
}

module.exports = { generateCashflowPdf };