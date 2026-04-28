const twilio = require("twilio")
const client = require("../config/twilio")

function createResponse(message){
 const twiml = new twilio.twiml.MessagingResponse()
 twiml.message(message)
 return twiml.toString()
}

function parseIncoming(req){
    return {
        phone: req.body.From,
        body: req.body.Body?.trim() || "",
        name: req.body.ProfileName || null
    }
}

function sendTwimlResponse(res, message){
    res.type("text/xml").send(createResponse(message))
}

async function sendMessage(to, message) {
    try {
        // Skip sending if Twilio credentials are not configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
            console.log("Twilio credentials not configured. Skipping message send.")
            return { success: false, message: "Twilio not configured" }
        }

        return await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to,
            body: message
        })
    } catch (error) {
        console.log("Error sending Twilio message:", error.message)
        // Don't throw error, just log it - booking should still succeed
        return { success: false, message: error.message }
    }
}

async function sendMediaMessage(to, body, mediaUrl) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    body,
    mediaUrl: [mediaUrl], 
  });
}

module.exports = {
    createResponse,
    parseIncoming,
    sendTwimlResponse,
    sendMessage,
    sendMediaMessage
}
