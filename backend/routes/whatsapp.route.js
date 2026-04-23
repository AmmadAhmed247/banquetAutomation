const express = require("express")
const router = express.Router()
const { handleWhatsappWebhook } = require("../controllers/whatsapp.controller")

router.post("/handleWebhook", handleWhatsappWebhook)

module.exports = router