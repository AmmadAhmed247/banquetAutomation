const cron = require("node-cron")
const { sendDailyCashflowSummary } = require("../services/cashflowSummary.service")

async function runDailyCashflowSummary() {
    try {
        if (!process.env.OWNER_PHONE) {
            console.log("[CashflowSummary] OWNER_PHONE not set in .env — skipping send.")
            return
        }

        console.log(`[CashflowSummary] Generating summary as of ${new Date().toISOString()}`)

        const result = await sendDailyCashflowSummary(process.env.OWNER_PHONE)

        console.log(`[CashflowSummary] Sent. Money In: ${result.data.totalIn}, Money Out: ${result.data.totalOut}, Net: ${result.data.net}`)
    } catch (error) {
        console.error("[CashflowSummary] Job-level error:", error)
    }
}

// SCHEDULER (registered once, only when startCashflowSummaryJob() is called)
function startCashflowSummaryJob() {
    cron.schedule("* * * * *", async () => {
        console.log("=== Running Daily Cashflow Summary job ===")
        await runDailyCashflowSummary()
        console.log("=== Cashflow Summary job complete ===")
    })
    console.log("Cashflow summary cron job scheduled")
}

module.exports = {
    startCashflowSummaryJob,
    runDailyCashflowSummary,
}