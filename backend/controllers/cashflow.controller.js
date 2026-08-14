const { computeCashflowSummary } = require("../services/cashflow.service");

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD
const getCashflow = async (req, res) => {
  try {
    const { start: startQ, end: endQ } = req.query;

    const todayStr = new Date().toISOString().split("T")[0];
    const startDate = new Date(`${startQ || todayStr}T00:00:00.000`);
    const endDate = new Date(`${endQ || startQ || todayStr}T23:59:59.999`);

    const data = await computeCashflowSummary(startDate, endDate, { startQ, endQ });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error building cashflow summary:", err);
    return res.status(500).json({ success: false, message: "Failed to compute cashflow" });
  }
};

module.exports = { getCashflow };