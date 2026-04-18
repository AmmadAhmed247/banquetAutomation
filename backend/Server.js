const express = require("express")
const app = express()
const dotenv = require("dotenv")

dotenv.config()

app.listen(3000, ()=> {
    console.log("Server Is Running At PORT")
})