const express = require("express")
const app = express()
const cors = require("cors")
const dotenv = require("dotenv")
const UserRouter = require("./routes/user.route")
const BookingRouter = require("./routes/booking.route")
const PackageRouter = require("./routes/package.route")
const WhatsappRouter = require("./routes/whatsapp.route")
const messageRouter = require("./routes/message.route")
const receiptRouter = require("./routes/receipt.route")
const clientRoute = require("./routes/clients.route")
const authRoute = require("./routes/auth.route")
const expenseRouter = require("./routes/expense.route")
const addonRouter = require("./routes/addon.route")
const monthlyExpenseRouter = require("./routes/monthlexpense.route")
const dailyExpenseRouter = require("./routes/dailyExpense.route")
const PaymentRouter = require("./routes/payment.route")
const CashflowRouter = require("./routes/cashflow.route")
const cookieParser = require("cookie-parser");
const path = require("path");
const { startReminderJobs } = require("./jobs/reminder.jobs")
const { startCashflowSummaryJob } = require("./jobs/cashflowSummary.jobs")
const { StartDbBackUp, runDatabaseBackup } = require("./scripts/backupdb")
const { adminOnly } = require("./middlewares/auth.middleware")

dotenv.config()

// CORS Configuration
app.use(cors({
    origin: [process.env.FIRST_DEV, process.env.FRONT_URL, process.env.API_URL, process.env.SECOND_DEV, process.env.BACKEND_DEV, process.env.STATIC_URL],
    credentials: true
}))

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/public", express.static(path.join(__dirname, "public")));
startReminderJobs();
startCashflowSummaryJob();
StartDbBackUp();
app.get("/", (req, res) => {
    console.log("API WORKING!")

    return res.status(200).json({
        success: true,
        message: "API IS WORKING FINE!"
    })
})



app.use("/api/user", adminOnly, UserRouter)
app.use("/api/booking", adminOnly, BookingRouter)
app.use("/api/package", adminOnly, PackageRouter)
app.use("/api/whatsapp", WhatsappRouter)
app.use("/api/message", adminOnly, messageRouter)
app.use("/api/receipt", adminOnly, receiptRouter)
app.use("/api/auth", authRoute)
app.use("/api/client", adminOnly, clientRoute)
app.use("/api/expense", adminOnly, expenseRouter)
app.use("/api/addon", adminOnly, addonRouter)
app.use("/api/monthlyexpense", adminOnly, monthlyExpenseRouter)
app.use("/api/dailyExpense", adminOnly, dailyExpenseRouter)
app.use("/api/payments", adminOnly, PaymentRouter)
app.use("/api/cashflow", adminOnly, CashflowRouter)

app.listen(3000, () => {
    console.log("Server Is Running At 3000")
})
