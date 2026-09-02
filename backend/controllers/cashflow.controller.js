const { computeCashflowSummary } = require("../services/cashflow.service");

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD
const getCashflow = async (req, res) => {
  try {
    const { start: startQ, end: endQ } = req.query;

    let startDate, endDate;
    if (!startQ && !endQ) {
      startDate = new Date("2000-01-01T00:00:00.000Z");
      endDate = new Date("2100-01-01T00:00:00.000Z");
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      startDate = new Date(`${startQ || todayStr}T00:00:00.000+05:00`);
      endDate = new Date(`${endQ || startQ || todayStr}T23:59:59.999+05:00`);
    }

    const data = await computeCashflowSummary(startDate, endDate, { startQ, endQ });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error building cashflow summary:", err);
    return res.status(500).json({ success: false, message: "Failed to compute cashflow" });
  }
};

module.exports = { getCashflow };