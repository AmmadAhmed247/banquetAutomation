const { parseIncoming, sendMessage, sendTwimlResponse } = require("../services/twillo.service")
const { getSession, setSession } = require("../services/session.service")
const { getOrCreateUser } = require("../services/user.service")
const { parseWhatsAppMessage, CreateBooking } = require("../services/booking.service")
const { getHelpMessage, getPackagesMessage, getGalleryMessage} = require("../services/message.service")

async function handleWhatsappWebhook(req, res) {
    const { phone, body } = parseIncoming(req)
    const keyword = body.toUpperCase().trim()

    try {
        const session = getSession(phone)

        if(keyword === "HELP"){
            const msg = await getHelpMessage()
            return sendTwimlResponse(res, msg)
        }

        if(keyword === "PACKAGES"){
            const msg = await getPackagesMessage()
            return sendTwimlResponse(res, msg)
        }

        if(keyword === "GALLERY"){
            const msg = await getGalleryMessage()
            return sendTwimlResponse(res, msg)
        }

        if (!session) {
            const result = await getOrCreateUser(phone, null)

            if (result.isNew) {
                setSession(phone, { step: "awaiting_name" })
                return sendTwimlResponse(res, "Welcome to Hall Automation! What's your name?\n\nSend HELP to see available commands.")
            } else {
                setSession(phone, { step: "ready", name: result.user.name })
                return sendTwimlResponse(res, `Welcome back ${result.user.name}!\n\nSend HELP to see available commands.`);
            }
        }

        if (session.step === "awaiting_name") {
            await getOrCreateUser(phone, body)
            setSession(phone, { step: "ready", name: body })
            return sendTwimlResponse(res, `Thanks ${body}! Send HELP to see what you can do.`);

        }

        if (session.step === "ready") {
            const data = parseWhatsAppMessage(body, phone)

            if (data) {
                await CreateBooking({ ...data, client: session.name, phone })
                return sendTwimlResponse(res, `Booking confirmed for ${session.name}!\n\nEvent: ${data.event}\nDate: ${data.date}\nPackage: ${data.package}\n\nWe'll be in touch soon.`);
            }
            return sendTwimlResponse(res, "Command not recognised. Send HELP to see available commands.");

        }

    } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return sendTwimlResponse(res, "Something went wrong, please try again.");
    }

}

module.exports = {
    handleWhatsappWebhook
}