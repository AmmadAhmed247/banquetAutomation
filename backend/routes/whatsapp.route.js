const express = require("express")
const router = express.Router()
const { handleWhatsappWebhook, SendMenuFromVoiceAgent } = require("../controllers/whatsapp.controller")
const { handleInbound: handleAgentWebhook } = require("../controllers/Inboxwebhook.controller")
const dotenv = require("dotenv")

dotenv.config()

const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('Webhook verified!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
};

router.get("/handleWebhook", verifyWebhook);
router.get("/agentWebhook", verifyWebhook);

router.post("/handleWebhook", handleWhatsappWebhook)
router.post("/agentWebhook", handleAgentWebhook)

router.post("/voice/sendMenu", SendMenuFromVoiceAgent);

module.exports = router