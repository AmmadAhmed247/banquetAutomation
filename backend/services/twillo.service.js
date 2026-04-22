const twilio = require("twilio")

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

module.exports = {
    createResponse,
    parseIncoming,
    sendTwimlResponse
}
