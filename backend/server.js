const express = require("express")
const app = express()
const dotenv = require("dotenv")
const UserRouter = require("./routes/user.route")
const BookingRouter = require("./routes/booking.route")

dotenv.config()

app.use("/api/user", UserRouter)
app.use("/api/booking", BookingRouter)

app.listen(3000, ()=> {
    console.log("Server Is Running At PORT")
})