const cron = require("node-cron");
const { sendDailySummaryReport } = require("../services/cashflowSummary.service");

async function runDailyCashflowSummary(overridePhone) {
    try {
        const targetPhone = overridePhone || process.env.ADMIN_PHONE;

        if (!targetPhone) {
            console.log("[CashflowSummary] No target phone available — skipping send.");
            return;
        }

        console.log(`[CashflowSummary] Running daily report job as of ${new Date().toISOString()} for ${targetPhone}`);

        const result = await sendDailySummaryReport(targetPhone);

        if (result.success) {
            console.log(
                `[CashflowSummary] Report sent successfully to ${targetPhone}! Today Bookings: ${result.todayCount}, Tomorrow Bookings: ${result.tomorrowCount}`
            );
        } else {
            console.error(`[CashflowSummary] Failed to send report to ${targetPhone}:`, result.error);
        }

    } catch (error) {
        console.error("[CashflowSummary] Job-level error:", error);
    }
}

function startCashflowSummaryJob() {
    cron.schedule("58 23 * * *", async () => {
        console.log("=== Running Daily Cashflow Summary job ===");
        await runDailyCashflowSummary(); 
        console.log("=== Cashflow Summary job complete ===");
    }, {
        timezone: "Asia/Karachi"
    });
    console.log("Cashflow summary cron job scheduled (Daily at 11:58 PM)");
}

module.exports = {
    startCashflowSummaryJob,
    runDailyCashflowSummary,
};