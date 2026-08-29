const { parseIncoming, sendMessage, sendVoiceCallFollowup } = require("../services/meta.service.")
const { getSession, setSession, clearSession, getActiveHandoffCustomer, setActiveHandoffCustomer, updateLastInbound } = require("../services/session.service")
const { getOrCreateUser } = require("../services/user.service")
const { parseWhatsAppMessage, CreateBooking } = require("../services/booking.service")
const { getHelpMessage, getGalleryMessage, getCalendarMessage, getReceiptMessage } = require("../services/message.service")
const { createOrGetConversation, addAdminToConversation } = require("../services/conversation.service");
const { recordStatus } = require("../services/messageStatus.service");

async function handleWhatsappWebhook(req, res) {
    res.sendStatus(200);
    const statusEntry = req.body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
    if (statusEntry) {
        console.log("[WA Status]", JSON.stringify({
            messageId: statusEntry.id,
            recipient: statusEntry.recipient_id,
            status: statusEntry.status,
            timestamp: statusEntry.timestamp,
            errors: statusEntry.errors || null
        }, null, 2));
        recordStatus(statusEntry.id, statusEntry.status, statusEntry.timestamp);
        return;
    }

    const parsed = parseIncoming(req);
    if (!parsed) return; // acknowledge Meta immediately



    const { phone, body } = parsed;
    const cleanBody = body.trim();
    const keyword = cleanBody.toUpperCase();
    await updateLastInbound(phone);

    try {
        let session = getSession(phone);

        // 1. Handle Brand New Users or Missing Sessions
        if (!session) {
            const result = await getOrCreateUser(phone, null);

            setSession(phone, { step: "selecting_hall", name: result?.user?.name || null });

            return sendMessage(
                phone,
                `Welcome to Darbar Banquet! \n\nPlease choose your preferred hall:\n\n*1* : Banquet A (Capacity: 650)\n*2* : Banquet B (Capacity: 200)`
            );
        }

        // 2. Handle Hall Selection Step (Accepts 1, 2, A, B, or full names)
        if (session.step === "selecting_hall") {
            let hall = null;
            if (keyword === "1" || keyword === "A" || keyword === "HALL A") hall = "Hall A";
            if (keyword === "2" || keyword === "B" || keyword === "HALL B") hall = "Hall B";

            if (!hall) {
                return sendMessage(
                    phone,
                    `Please choose the correct option from the list below:\n\n` +
                    `*1* : Banquet A (Capacity: 650) (Capacity: 650)\n` +
                    `*2* : Banquet B (Capacity: 200)\n\n` +
                    `Please reply with a valid option.`
                );
            }

            setSession(phone, { ...session, step: "ready", active_hall: hall });

            return sendMessage(
                phone,
                `You have selected *${hall}*!\n\nHere are your available options:\n\n` +
                `*1* — CALENDAR (View availability)\n` +
                `*2* — GALLERY (See venue photos)\n` +
                `*3* — SUPPORT (Talk to a human)\n` +
                `*4* — HELP (Show this menu)\n\n` +
                `(Type *SWITCH* or *HALL* anytime to change halls)`
            );
        }

        // 3. Global commands
        if (keyword === "HELP" || keyword === "4" || keyword === "MENU") {
            return sendMessage(
                phone,
                `Darbar Banquet Assistant Menu\n\n` +
                `Please choose an option below:\n\n` +
                `*1* — CALENDAR (View availability)\n` +
                `*2* — GALLERY (See venue photos)\n` +
                `*3* — SUPPORT (Talk to a human)\n` +
                `*4* — HELP (Show this menu)\n\n` +
                `(Type *SWITCH* or *HALL* anytime to change halls)`
            );
        }

        if (keyword === "GALLERY" || keyword === "2") {
            const msg = await getGalleryMessage();

            sendMessage(phone, msg);
            return sendMessage(phone, `Type *HELP* to show the menu or *SWITCH* to change halls.`);
        }

        if ((keyword === "CALENDAR" || keyword === "1") && session?.step !== "awaiting_month") {
            setSession(phone, { ...session, step: "awaiting_month" });
            const currentHall = session.hall || session.active_hall || "Hall A";
            return sendMessage(phone, `Which month would you like to see for *${currentHall}*? (e.g. *July* or *7*)`);
        }

        if (keyword === "SUPPORT" || keyword === "3") {
            const result = await getOrCreateUser(phone, null);
            const name = result?.user?.name || session?.name || "Unknown";

            await sendMessage(
                process.env.ADMIN_PHONE,
                `Support request!\n\nName: ${name}\nPhone: ${phone}\n\nReply directly to this number to respond.\nSend END to hand back to the bot.`
            );

            setActiveHandoffCustomer(phone);
            setSession(phone, { ...session, name, step: "human_handoff" });
            return sendMessage(phone, "Connecting you to our team. A team member will reply shortly.\n\nSend HELP to return to the bot.");
        }

        // Allow user to switch halls at any time
        if (keyword === "HALL" || keyword === "SWITCH") {
            setSession(phone, { ...session, step: "selecting_hall" });
            return sendMessage(
                phone,
                `Please choose your preferred hall:\n\n` +
                `*1* : Banquet A (Capacity: 650)\n` +
                `*2* : Banquet B (Capacity: 200)`
            );
        }

        // 4. Handle Human Handoff Step
        if (session?.step === "human_handoff") {
            if (keyword === "HELP" || keyword === "4") {
                clearSession(phone);
                return sendMessage(
                    phone,
                    `Darbar Banquet Assistant Menu\n\n` +
                    `Please choose an option below:\n\n` +
                    `*1* — CALENDAR (View availability)\n` +
                    `*2* — GALLERY (See venue photos)\n` +
                    `*3* — SUPPORT (Talk to a human)\n` +
                    `*4* — HELP (Show this menu)`
                );
            }
            return;
        }


        // 5. Handle Calendar Month Step
        if (session?.step === "awaiting_month") {
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            let monthNum = null;

            const asNumber = parseInt(cleanBody, 10);
            if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 12) {
                monthNum = asNumber;
            } else {
                const idx = monthNames.indexOf(cleanBody.toLowerCase());
                if (idx !== -1) monthNum = idx + 1;
            }

            if (!monthNum) {
                return sendMessage(phone, "Please reply with a valid month, like *July* or *7*.");
            }

            // Determine the year dynamically based on the current date
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-indexed (1 to 12)

            // If requested month has already passed this year, assign next year
            const targetYear = monthNum < currentMonth ? currentYear + 1 : currentYear;

            const hallToQuery = session.hall || session.active_hall || "Hall A";

            await getCalendarMessage(phone, hallToQuery, targetYear, monthNum);

            setSession(phone, { ...session, step: "ready" });
        }

        // 6. Ready State / Fallback for unrecognized keywords
        if (session.step === "ready") {
            const data = parseWhatsAppMessage(body, phone);

            if (data) {
                await CreateBooking({ ...data, client: session.name || "Customer", phone });
                return sendMessage(phone, `Booking confirmed for ${session.name || "Customer"}!\n\nEvent: ${data.event}\nDate: ${data.date}\nPackage: ${data.package}\n\nWe'll be in touch soon.`);
            }

            // Clean vertical format for incorrect main menu inputs
            return sendMessage(
                phone,
                `Please choose the correct menu option from the list below:\n\n` +
                `*1* — CALENDAR (View availability)\n` +
                `*2* — GALLERY (See venue photos)\n` +
                `*3* — SUPPORT (Talk to a human)\n` +
                `*4* — HELP (Show this menu)\n\n` +
                `(Type *SWITCH* or *HALL* anytime to change halls) \n\n `

            );
        }

        if (phone === process.env.ADMIN_PHONE && keyword === "END") {
            return;
        }

    } catch (error) {
        console.error("WhatsApp webhook error:", error);
        return sendMessage(phone, "Something went wrong, please try again.");
    }
}


async function SendMenuFromVoiceAgent(req, res) {
    console.log("Voice webhook hit. Headers:", req.headers);
    console.log("Voice webhook body:", req.body);
    try {
        if (req.headers["x-voice-agent-secret"] !== process.env.VOICE_AGENT_SECRET) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        console.log("WORKING")

        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "phone is required" });
        }

        const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "92");

        const result = await sendVoiceCallFollowup(phone, "en");

        if (!result.success) {
            console.error("Failed to send voice call followup template:", result.message);
            return res.status(500).json({ success: false, message: "Failed to send WhatsApp message" });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error sending menu from voice agent:", error);
        return res.status(500).json({ success: false, message: "Failed to send WhatsApp menu" });
    }
}

module.exports = {
    handleWhatsappWebhook,
    SendMenuFromVoiceAgent
};