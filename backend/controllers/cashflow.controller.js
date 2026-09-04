const { computeCashflowSummary } = require("../services/cashflow.service");

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD&range=all
const getCashflow = async (req, res) => {
  try {
    const { start: startQ, end: endQ, range } = req.query;

    let startDate, endDate;
    if (range === "all" || (!startQ && !endQ)) {
      startDate = new Date("2000-01-01T00:00:00.000+05:00");
      endDate = new Date("2100-12-31T23:59:59.999+05:00");
    } else {

      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const sDate = startQ || todayStr;
      const eDate = endQ || sDate;

      // Lock boundaries precisely to PKT (+05:00) start of day and end of day
      startDate = new Date(`${sDate}T00:00:00.000+05:00`);
      endDate = new Date(`${eDate}T23:59:59.999+05:00`);
    }

    const data = await computeCashflowSummary(startDate, endDate, { startQ, endQ, range });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error building cashflow summary:", err);
    return res.status(500).json({ success: false, message: "Failed to compute cashflow" });
  }
};

module.exports = { getCashflow };