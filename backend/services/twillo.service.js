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
    return client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to,
        body: message
    })
}

module.exports = {
    createResponse,
    parseIncoming,
    sendTwimlResponse,
    sendMessage
}
