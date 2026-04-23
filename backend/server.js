const express = require("express")
const app = express()
const dotenv = require("dotenv")
const UserRouter = require("./routes/user.route")
const BookingRouter = require("./routes/booking.route")
const PackageRouter = require("./routes/package.route")
const WhatsappRouter = require("./routes/whatsapp.route")

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/health", (req,res)=> {
    return res.status(200).json({
        success: true,
        message: "API IS WORKING FINE!"
    })
})

app.use("/api/user", UserRouter)
app.use("/api/booking", BookingRouter)
app.use("/api/package", PackageRouter)
app.use("/api/whatsapp", WhatsappRouter)

app.listen(3000, ()=> {
    console.log("Server Is Running At PORT")
})