const express = require("express")
const { SendReceiptMessage } = require("../controllers/receipt.controller")
const router = express.Router()

router.post("/sendReceipt", SendReceiptMessage)

module.exports = router