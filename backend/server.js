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
const clientRoute=require("./routes/clients.route")
const authRoute=require("./routes/auth.route")
const cookieParser = require("cookie-parser");
const path = require("path");
require("./jobs/reminder.jobs")

dotenv.config()

// CORS Configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000","https://banquet-automation.vercel.app"],
  credentials: true
}))

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req,res)=> {
    console.log("API WORKING!")

    return res.status(200).json({
        success: true,
        message: "API IS WORKING FINE!"
    })
})

app.use("/api/user", UserRouter)
app.use("/api/booking", BookingRouter)
app.use("/api/package", PackageRouter)
app.use("/api/whatsapp", WhatsappRouter)
app.use("/api/message", messageRouter)
app.use("/api/receipt", receiptRouter)
app.use("/api/auth", authRoute)
app.use("/api/client", clientRoute)

app.listen(3000, ()=> {
    console.log("Server Is Running At 3000")
})
