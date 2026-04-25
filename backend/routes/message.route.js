const express = require("express")
const { SendMessageManually } = require("../controllers/message.controller")
const router = express.Router()

router.post("/sendMessage", SendMessageManually)

module.exports = router