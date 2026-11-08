const { computeCashflowSummary } = require("../services/cashflow.service");
const { generateCashflowPdf } = require("../services/cashFlowPDF");

const todayPKT = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());

async function exportCashflowPdf(req, res) {
  try {
    const today = todayPKT();                         // e.g. 2026-11-05
    const monthStartStr = `${today.slice(0, 7)}-01`;  // e.g. 2026-11-01

    const startDate = new Date(`${monthStartStr}T00:00:00.000+05:00`);
    const endDate = new Date(); // latest moment = right now

    const summary = await computeCashflowSummary(startDate, endDate, {
      startQ: monthStartStr,
      endQ: today,
      range: "month",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="cashflow-${today.slice(0, 7)}.pdf"`
    );

    generateCashflowPdf(res, summary, {
      title: "Cashflow & Finance Report",
      fromLabel: monthStartStr,
      toLabel: today,
    });
  } catch (err) {
    console.error("Cashflow PDF export failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
    else res.end();
  }
}

module.exports = { exportCashflowPdf };