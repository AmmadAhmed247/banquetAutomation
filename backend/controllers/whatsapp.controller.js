const { parseIncoming, sendMessage, sendVoiceCallFollowup } = require("../services/meta.service.")
const { getSession, setSession, clearSession, getActiveHandoffCustomer, setActiveHandoffCustomer, updateLastInbound } = require("../services/session.service")
const { getOrCreateUser } = require("../services/user.service")
const { parseWhatsAppMessage, CreateBooking } = require("../services/booking.service")
const { getHelpMessage, getGalleryMessage, getCalendarMessage, getReceiptMessage, getMonthPriceMessage, parseMonthYearInput } = require("../services/message.service")
const { createOrGetConversation, addAdminToConversation } = require("../services/conversation.service");
const { recordStatus } = require("../services/messageStatus.service");
const { runDailyCashflowSummary } = require("../jobs/cashflowSummary.jobs.js");

const MENU_TEXT =
    `Darbar Banquet Assistant Menu\n\n` +
    `Please choose an option below:\n\n` +
    `*1* — CALENDAR (View availability)\n` +
    `*2* — GALLERY (See venue photos)\n` +
    `*3* — SUPPORT (Talk to a human)\n` +
    `*4* — HELP (Show this menu)\n` +
    `*5* — PRICING (View month pricing)\n\n` +
    `(Type *SWITCH* or *HALL* anytime to change halls)`;

async function handleWhatsappWebhook(req, res) {
    res.sendStatus(200);
    console.log("[RAW BODY]", JSON.stringify(req.body, null, 2));

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
    if (!parsed) return;

    const { phone, body } = parsed;
    const cleanBody = body.trim();
    const keyword = cleanBody.toUpperCase();
    await updateLastInbound(phone);
    console.log("[DEBUG] phone:", JSON.stringify(phone), "| ADMIN_PHONE:", JSON.stringify(process.env.ADMIN_PHONE), "| keyword:", JSON.stringify(keyword));

    const adminPhonesDigits = (process.env.ADMIN_PHONES || "")
        .split(",")
        .map(p => p.trim().replace(/\D/g, ""))
        .filter(Boolean);

    if (adminPhonesDigits.includes(phone) && keyword === "/ADMIN") {
        console.log("[ADMIN TRIGGER] Matched! phone:", phone, "| admin list:", adminPhonesDigits);
        try {
            await runDailyCashflowSummary(phone);
            console.log("[ADMIN TRIGGER] Report job completed, sent to:", phone);
        } catch (err) {
            console.error("[ADMIN TRIGGER] Failed:", err);
        }
        return;
    }

    try {
        let session = getSession(phone);

        // 1. Brand new users / missing session
        if (!session) {
            const result = await getOrCreateUser(phone, null);
            await setSession(phone, { step: "selecting_hall", name: result?.user?.name || null });

            return sendMessage(
                phone,
                `Welcome to Darbar Banquet! \n\nPlease choose your preferred hall:\n\n*1* : Banquet A (Capacity: 650)\n*2* : Banquet B (Capacity: 200)`
            );
        }

        // Global escape hatch: let user switch halls or see the menu at ANY step
        if (keyword === "HALL" || keyword === "SWITCH") {
            await setSession(phone, { ...session, step: "selecting_hall" });
            return sendMessage(
                phone,
                `Please choose your preferred hall:\n\n` +
                `*1* : Banquet A (Capacity: 650)\n` +
                `*2* : Banquet B (Capacity: 200)`
            );
        }

        if (keyword === "HELP" || keyword === "MENU") {
            await setSession(phone, { ...session, step: "ready" });
            return sendMessage(phone, MENU_TEXT);
        }

        // 2. Hall selection step
        if (session.step === "selecting_hall") {
            let hall = null;
            if (keyword === "1" || keyword === "A" || keyword === "HALL A") hall = "Hall A";
            if (keyword === "2" || keyword === "B" || keyword === "HALL B") hall = "Hall B";

            if (!hall) {
                return sendMessage(
                    phone,
                    `Please choose the correct option from the list below:\n\n` +
                    `*1* : Banquet A (Capacity: 650)\n` +
                    `*2* : Banquet B (Capacity: 200)\n\n` +
                    `Please reply with a valid option.`
                );
            }

            await setSession(phone, { ...session, step: "ready", active_hall: hall });

            return sendMessage(
                phone,
                `You have selected *${hall}*!\n\nHere are your available options:\n\n` +
                `*1* — CALENDAR (View availability)\n` +
                `*2* — GALLERY (See venue photos)\n` +
                `*3* — SUPPORT (Talk to a human)\n` +
                `*4* — HELP (Show this menu)\n` +
                `*5* — PRICING (View month pricing)\n\n` +
                `(Type *SWITCH* or *HALL* anytime to change halls)`
            );
        }

        // 3. STEP-SPECIFIC HANDLERS FIRST — these take priority over global keywords
        // so a numeric reply like "5" while awaiting a month is never mistaken for a menu command.

        if (session.step === "awaiting_month") {
            const { monthNum, yearNum } = parseMonthYearInput(cleanBody);

            if (!monthNum) {
                return sendMessage(phone, "Please choose a valid option, like *July* or *7*.");
            }

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            const targetYear = yearNum
                ? yearNum
                : (monthNum < currentMonth ? currentYear + 1 : currentYear);

            const hallToQuery = session.active_hall || "Hall A";

            await setSession(phone, { ...session, step: "ready" });
            await getCalendarMessage(phone, hallToQuery, targetYear, monthNum);
            return sendMessage(phone, `Type *HELP* to show the menu or *SWITCH* to change halls.`);
        }

        if (session.step === "awaiting_pricing_month") {
            const { monthNum } = parseMonthYearInput(cleanBody);

            if (!monthNum) {
                return sendMessage(phone, "Please choose a valid option, like *July* or *7*.");
            }

            const hallToQuery = session.active_hall || "Hall A";
            await setSession(phone, { ...session, step: "ready" });
            return sendMessage(phone, getMonthPriceMessage(hallToQuery, monthNum));
        }

        if (session.step === "human_handoff") {
            if (keyword === "HELP" || keyword === "4") {
                await clearSession(phone);
                return sendMessage(phone, MENU_TEXT);
            }
            return;
        }

        // 4. Global commands (only reached if not in a step that consumes input above)
        if (keyword === "GALLERY" || keyword === "2") {
            const msg = await getGalleryMessage();
            await sendMessage(phone, msg);
            return sendMessage(phone, `Type *HELP* to show the menu or *SWITCH* to change halls.`);
        }

        if (keyword === "CALENDAR" || keyword === "1") {
            await setSession(phone, { ...session, step: "awaiting_month" });
            const currentHall = session.active_hall || "Hall A";
            return sendMessage(phone, `Which month would you like to see for *${currentHall}*? (e.g. *July* or *7*)`);
        }

        if (keyword === "PRICING" || keyword === "5") {
            await setSession(phone, { ...session, step: "awaiting_pricing_month" });
            return sendMessage(phone, `Which month would you like pricing for? (e.g. *July* or *7*)`);
        }

        if (keyword === "SUPPORT" || keyword === "3") {
            const result = await getOrCreateUser(phone, null);
            const name = result?.user?.name || session?.name || "Unknown";

            await sendMessage(
                process.env.ADMIN_PHONE,
                `Support request!\n\nName: ${name}\nPhone: ${phone}\n\nReply directly to this number to respond.\nSend END to hand back to the bot.`
            );

            setActiveHandoffCustomer(phone);
            await setSession(phone, { ...session, name, step: "human_handoff" });
            return sendMessage(phone, "Connecting you to our team. A team member will reply shortly.\n\nSend HELP to return to the bot.");
        }

        // 5. Ready state / fallback for unrecognized input
        if (session.step === "ready") {
            const data = parseWhatsAppMessage(body, phone);

            if (data) {
                await CreateBooking({ ...data, client: session.name || "Customer", phone });
                return sendMessage(phone, `Booking confirmed for ${session.name || "Customer"}!\n\nEvent: ${data.event}\nDate: ${data.date}\nPackage: ${data.package}\n\nWe'll be in touch soon.`);
            }

            return sendMessage(
                phone,
                `Please choose the correct menu option from the list below:\n\n` +
                `*1* — CALENDAR (View availability)\n` +
                `*2* — GALLERY (See venue photos)\n` +
                `*3* — SUPPORT (Talk to a human)\n` +
                `*4* — HELP (Show this menu)\n` +
                `*5* — PRICING (View month pricing)\n\n` +
                `(Type *SWITCH* or *HALL* anytime to change halls)`
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

        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "phone is required" });
        }

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