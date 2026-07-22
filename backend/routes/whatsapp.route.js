const express = require("express")
const router = express.Router()
const { handleWhatsappWebhook } = require("../controllers/whatsapp.controller")
const dotenv = require("dotenv")

dotenv.config()

router.get("/handleWebhook", (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('Webhook verified!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

router.post("/handleWebhook", handleWhatsappWebhook)

module.exports = router