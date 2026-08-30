const cron = require("node-cron");
const { sendDailySummaryReport } = require("../services/cashflowSummary.service");

async function runDailyCashflowSummary() {
    try {
        if (!process.env.OWNER_PHONE) {
            console.log("[CashflowSummary] OWNER_PHONE not set in .env — skipping send.");
            return;
        }

        console.log(`[CashflowSummary] Running daily report job as of ${new Date().toISOString()}`);

        // Call the unified report function (handles image generation & template sending)
        const result = await sendDailySummaryReport(process.env.ADMIN_PHONE);

        if (result.success) {
            console.log(
                `[CashflowSummary] Report sent successfully! Today Bookings: ${result.todayCount}, Tomorrow Bookings: ${result.tomorrowCount}`
            );
        } else {
            console.error("[CashflowSummary] Failed to send report template:", result.error);
        }

    } catch (error) {
        console.error("[CashflowSummary] Job-level error:", error);
    }
}





module.exports = {
    startCashflowSummaryJob,
    runDailyCashflowSummary,
};