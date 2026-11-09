const crypto = require("crypto");
const inbox = require("../services/Inbox.service");
const { runAgent } = require("../services/Agent.service");
const { handleWhatsappWebhook } = require("./whatsapp.controller"); // your existing handler

const FALLBACK = "Thanks for your message. Our team will reply to you shortly.";

// One job at a time per phone number, so quick back-to-back messages don't get two replies.
const queues = new Map();
function enqueue(key, job) {
    const next = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(job);
    queues.set(key, next);
    next.finally(() => queues.get(key) === next && queues.delete(key)).catch(() => {});
    return next;
}

const textOf = (msg) =>
    msg.type === "text" ? msg.text?.body
    : msg.type === "button" ? msg.button?.text
    : msg.type === "interactive" ? msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title
    : null;

// Optional: set APP_SECRET (Meta app secret) to reject fake webhook calls.
// Needs the raw body: app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }))
function signatureOk(req) {
    const secret = process.env.APP_SECRET;
    if (!secret) return true;
    if (!req.rawBody) {
        console.error("APP_SECRET is set but req.rawBody is missing, rejecting webhook");
        return false;
    }
    const got = req.get("x-hub-signature-256") ?? "";
    const want = "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
    return got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

const isAdminCommand = (msg) => msg.type === "text" && /^\/admin\b/i.test(msg.text?.body ?? "");

async function handleInbound(req, res) {
    if (!signatureOk(req)) return res.sendStatus(401);

    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    // Delivery receipts: log them here, then let your existing handler keep receipt tracking working.
    if (value?.statuses?.length) {
        inbox.updateDeliveryStatuses(value.statuses).catch((e) => console.error("[inbox status]", e));
        return handleWhatsappWebhook(req, res);
    }

    const messages = value?.messages ?? [];
    if (!messages.length) return res.sendStatus(200);

    // "/admin" report commands stay with your existing handler.
    if (messages.some(isAdminCommand)) return handleWhatsappWebhook(req, res);

    res.sendStatus(200); // ack first, Meta retries slow responses
    for (const msg of messages) {
        enqueue(msg.from, () => processInbound(value, msg)).catch((e) => console.error("[inbox inbound]", e));
    }
}

async function processInbound(value, msg) {
    if (msg.type === "reaction") return;

    const contact = await inbox.upsertInboundContact({
        phone: msg.from,
        name: value.contacts?.[0]?.profile?.name,
        adId: msg.referral?.source_id, // only on the first message from a Click-to-WhatsApp ad
        adHeadline: msg.referral?.headline,
    });

    const text = textOf(msg);
    const logged = await inbox.logMessage({
        conversationId: contact.id,
        wa_message_id: msg.id,
        direction: "in",
        sender: "customer",
        type: msg.type,
        body: text ?? null,
    });
    if (!logged) return; // duplicate delivery

    if (!text) return inbox.handleUnsupportedMedia(contact); // voice, image, sticker...
    if (contact.bot_paused) return; // a person has this chat

    const started = Date.now();
    try {
        const { reply, toolCalls } = await runAgent(contact);
        if (reply?.trim()) {
            await inbox.sendOutbound(contact, reply, { sender: "bot", toolCalls, latencyMs: Date.now() - started });
        }
    } catch (err) {
        console.error("[agent]", err);
        await inbox.flagContact(contact.id, "Agent error, needs a person", true).catch(() => {});
        await inbox.sendOutbound(contact, FALLBACK, { sender: "bot" }).catch(() => {});
    }
}

module.exports = { handleInbound };