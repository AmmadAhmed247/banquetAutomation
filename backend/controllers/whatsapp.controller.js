const { parseIncoming, sendMessage } = require("../services/meta.service.")
const { getSession, setSession, clearSession, getActiveHandoffCustomer, setActiveHandoffCustomer } = require("../services/session.service")
const { getOrCreateUser } = require("../services/user.service")
const { parseWhatsAppMessage, CreateBooking } = require("../services/booking.service")
const { getHelpMessage, getPackagesMessage, getGalleryMessage, getCalendarMessage, getReceiptMessage } = require("../services/message.service")
const { createOrGetConversation, addAdminToConversation } = require("../services/conversation.service");

async function handleWhatsappWebhook(req, res) {
    res.sendStatus(200); // acknowledge Meta immediately — must respond fast, before any async work

    const parsed = parseIncoming(req);
    if (!parsed) return; // e.g. a status update, not an actual message

    const { phone, body } = parsed;
    const keyword = body.toUpperCase().trim();

    try {
        const session = getSession(phone);

        if (keyword === "HELP") {
            const msg = await getHelpMessage();
            return sendMessage(phone, msg);
        }

        if (keyword === "PACKAGES") {
            const msg = await getPackagesMessage();
            return sendMessage(phone, msg);
        }

        if (keyword === "GALLERY") {
            const msg = await getGalleryMessage();
            return sendMessage(phone, msg);
        }

        if (keyword === "CALENDAR") {
            await getCalendarMessage(phone);
            return;
        }
         if (keyword === "SUPPORT") {
            const result = await getOrCreateUser(phone, null);
            const name = result?.user?.name || session?.name || "Unknown";

            console.log(result)
            console.log(session)

            await sendMessage(
                process.env.ADMIN_PHONE,
                `Support request!\n\nName: ${name}\nPhone: ${phone}\n\nReply directly to this number to respond.\nSend END to hand back to the bot.`
            );

            setActiveHandoffCustomer(phone); 
            setSession(phone, { ...session, name, step: "human_handoff" });
            return sendMessage(phone, "Connecting you to our team. A team member will reply shortly.\n\nSend HELP to return to the bot.");
        }

        if (!session) {
            const result = await getOrCreateUser(phone, null);

            if (result.isNew) {
                setSession(phone, { step: "awaiting_name" });
                return sendMessage(phone, "Welcome to Hall Automation! What's your name?\n\nSend HELP to see available commands.");
            } else {
                setSession(phone, { step: "ready", name: result.user.name });
                return sendMessage(phone, `Welcome back ${result.user.name}!\n\nSend HELP to see available commands.`);
            }
        }

        if (session.step === "awaiting_name") {
            await getOrCreateUser(phone, body);
            setSession(phone, { step: "ready", name: body });
            return sendMessage(phone, `Thanks ${body}! Send HELP to see what you can do.`);
        }

        if (session.step === "ready") {
            const data = parseWhatsAppMessage(body, phone);

            if (data) {
                await CreateBooking({ ...data, client: session.name, phone });
                return sendMessage(phone, `Booking confirmed for ${session.name}!\n\nEvent: ${data.event}\nDate: ${data.date}\nPackage: ${data.package}\n\nWe'll be in touch soon.`);
            }
            return sendMessage(phone, "Command not recognised. Send HELP to see available commands.");
        }

        if (session?.step === "human_handoff") {
            if (keyword === "HELP") {
                clearSession(phone);
                const msg = await getHelpMessage();
                return sendMessage(phone, msg);
            }
            return;
        }

        if (phone === process.env.ADMIN_PHONE && keyword === "END") {
            return;
        }

    } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return sendMessage(phone, "Something went wrong, please try again.");
    }
}

module.exports = {
    handleWhatsappWebhook
};