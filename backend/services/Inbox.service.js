const { and, desc, eq, gte, ilike, isNull, or, sql } = require("drizzle-orm");
const { db } = require("../config/db");
const { user, conversation, waMessage } = require("../model/schema");
const { sendMessage } = require("./meta.service."); // same path your other services use
const { isWithinWindow } = require("./session.service");
const { emit } = require("../utils/inboxEvents");

const STATUSES = ["bot", "needs_human", "human", "resolved"];
const NUDGE = "Please type your message and we'll reply right away.\nBara-e-meherbani apna sawal likh kar bhejein.";

class InboxError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

/* ---------- Contact = conversation + user, flattened ---------- */

const CONTACT_FIELDS = {
    id: conversation.id,
    userId: conversation.userId,
    status: conversation.status,
    bot_paused: conversation.bot_paused,
    flag_reason: conversation.flag_reason,
    source_ad_id: conversation.source_ad_id,
    source_headline: conversation.source_headline,
    last_message_at: conversation.last_message_at,
    last_message_preview: conversation.last_message_preview,
    last_nudge_at: conversation.last_nudge_at,
    phone: user.phone,
    name: user.name,
    last_inbound_at: user.last_inbound_at,
};

const contactQuery = () =>
    db.select(CONTACT_FIELDS).from(conversation).innerJoin(user, eq(conversation.userId, user.id));

const toContactDto = (c) => ({
    id: c.id,
    name: c.name ?? `+${c.phone}`,
    phone: `+${c.phone}`,
    status: c.status,
    botPaused: c.bot_paused,
    flag: c.flag_reason,
    ad: c.source_headline ?? "Organic",
    preview: c.last_message_preview,
    lastMessageAt: c.last_message_at,
});

const toMessageDto = (m) => ({
    id: m.id,
    from: m.sender,
    type: m.type,
    text: m.body,
    time: m.created_at,
    tools: m.tool_calls ?? undefined,
    delivery: m.delivery_status,
});

const previewOf = ({ sender, type, body }) => {
    const text = type === "audio" ? "Voice note (not processed)" : body ?? `[${type}]`;
    return sender === "bot" ? `Bot: ${text}` : sender === "staff" ? `You: ${text}` : text;
};

async function getContact(id) {
    const [c] = await contactQuery().where(eq(conversation.id, id));
    if (!c) throw new InboxError("Conversation not found", 404);
    return c;
}

async function upsertInboundContact({ phone, name, adId, adHeadline }) {
    const now = new Date();

    await db.insert(user).values({ phone, name: name ?? null }).onConflictDoNothing({ target: user.phone });
    const [u0] = await db.select().from(user).where(eq(user.phone, phone));
    await db.update(user).set({ last_inbound_at: now, name: u0.name ?? name ?? null }).where(eq(user.id, u0.id));

    await db.insert(conversation).values({ userId: u0.id }).onConflictDoNothing({ target: conversation.userId });
    const [c0] = await db.select().from(conversation).where(eq(conversation.userId, u0.id));
    await db
        .update(conversation)
        .set({
            last_message_at: now,
            source_ad_id: c0.source_ad_id ?? adId ?? null,
            source_headline: c0.source_headline ?? adHeadline ?? null,
            status: c0.status === "resolved" ? "bot" : c0.status, // a new message reopens a resolved chat
        })
        .where(eq(conversation.id, c0.id));

    return getContact(c0.id);
}

async function listContacts({ status, q } = {}) {
    const conds = [];
    if (status && STATUSES.includes(status)) conds.push(eq(conversation.status, status));
    if (q) {
        const digits = q.replace(/\D/g, "").replace(/^0/, "");
        const byPhone = digits ? [ilike(user.phone, `%${digits}%`)] : [];
        conds.push(or(ilike(user.name, `%${q}%`), ...byPhone));
    }
    const rows = await contactQuery()
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(sql`(${conversation.status} = 'needs_human') DESC`, desc(conversation.last_message_at))
        .limit(200);
    return rows.map(toContactDto);
}

async function setStatus(id, status, { reason = null, pauseBot } = {}) {
    if (!STATUSES.includes(status)) throw new InboxError("Invalid status");
    const updated = await db
        .update(conversation)
        .set({
            status,
            bot_paused: pauseBot ?? status === "human",
            flag_reason: status === "needs_human" ? reason : null,
        })
        .where(eq(conversation.id, id))
        .returning({ id: conversation.id });
    if (!updated.length) throw new InboxError("Conversation not found", 404);
    const c = await getContact(id);
    emit("contact", toContactDto(c));
    return c;
}

const flagContact = (id, reason, pauseBot = true) => setStatus(id, "needs_human", { reason, pauseBot });

/* ---------- Messages ---------- */

async function logMessage(m) {
    const [row] = await db.insert(waMessage).values(m).onConflictDoNothing().returning();
    if (!row) return null; // duplicate wa_message_id (Meta retry)
    await db
        .update(conversation)
        .set({ last_message_at: row.created_at, last_message_preview: previewOf(row) })
        .where(eq(conversation.id, m.conversationId));
    const c = await getContact(m.conversationId);
    emit("message", { contact: toContactDto(c), message: toMessageDto(row) });
    return row;
}

async function getRecentMessages(conversationId, limit = 12) {
    const rows = await db
        .select()
        .from(waMessage)
        .where(eq(waMessage.conversationId, conversationId))
        .orderBy(desc(waMessage.id))
        .limit(limit);
    return rows.reverse();
}

async function getMessages(conversationId, limit = 100) {
    return (await getRecentMessages(conversationId, limit)).map(toMessageDto);
}

/** Send a text inside the 24h window and log it. */
async function sendOutbound(contact, text, { sender, toolCalls, latencyMs } = {}) {
    if (!isWithinWindow(contact.last_inbound_at)) {
        throw new InboxError("The 24-hour reply window is closed. Send an approved template instead.", 409);
    }
    const result = await sendMessage(contact.phone, text);
    if (!result?.success) throw new InboxError("WhatsApp could not send this message", 502);
    return logMessage({
        conversationId: contact.id,
        wa_message_id: result.data?.messages?.[0]?.id ?? null,
        direction: "out",
        sender,
        type: "text",
        body: text,
        tool_calls: toolCalls,
        latency_ms: latencyMs,
    });
}

async function sendStaffMessage(id, text) {
    const body = text?.trim();
    if (!body) throw new InboxError("Message is empty");
    const contact = await getContact(id);
    const msg = await sendOutbound(contact, body, { sender: "staff" });
    await setStatus(id, "human"); // replying pauses the bot
    return toMessageDto(msg);
}

async function updateDeliveryStatuses(statuses) {
    for (const s of statuses) {
        const err = s.errors?.[0];
        const [m] = await db
            .update(waMessage)
            .set({ delivery_status: s.status, delivery_error: err ? `${err.code}: ${err.title}` : null })
            .where(eq(waMessage.wa_message_id, s.id))
            .returning();
        if (m) emit("status", { id: m.id, contactId: m.conversationId, status: s.status, error: m.delivery_error });
    }
}

/* ---------- Text-only gate for voice notes, images, stickers ---------- */

async function handleUnsupportedMedia(contact) {
    if (contact.bot_paused) return; // staff is handling this chat
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!contact.last_nudge_at || contact.last_nudge_at < hourAgo) {
        await db.update(conversation).set({ last_nudge_at: new Date() }).where(eq(conversation.id, contact.id));
        await sendOutbound(contact, NUDGE, { sender: "bot" });
    }
    const [{ n }] = await db
        .select({ n: sql`count(*)::int` })
        .from(waMessage)
        .where(
            and(
                eq(waMessage.conversationId, contact.id),
                eq(waMessage.sender, "customer"),
                isNull(waMessage.body),
                gte(waMessage.created_at, new Date(Date.now() - 30 * 60 * 1000))
            )
        );
    if (n >= 2 && contact.status === "bot") {
        await flagContact(contact.id, "Sent voice notes or media instead of typing", false);
    }
}

/* ---------- Stats for the header bar ---------- */

const startOfKarachiDay = () => {
    const t = new Date(Date.now() + 5 * 3600e3); // Karachi is UTC+5, no DST
    t.setUTCHours(0, 0, 0, 0);
    return new Date(t.getTime() - 5 * 3600e3);
};

async function getStats() {
    const start = startOfKarachiDay().toISOString();
    const res = await db.execute(sql`
        SELECT
          (SELECT COUNT(*)::int FROM conversations c JOIN users u ON u.id = c.user_id
             WHERE u.last_inbound_at >= ${start}) AS total,
          (SELECT COUNT(*)::int FROM conversations WHERE status = 'needs_human') AS needs_human,
          (SELECT COUNT(*)::int FROM conversations c JOIN users u ON u.id = c.user_id
             WHERE u.last_inbound_at >= ${start} AND c.status <> 'needs_human'
             AND NOT EXISTS (SELECT 1 FROM wa_messages m
               WHERE m.conversation_id = c.id AND m.sender = 'staff' AND m.created_at >= ${start})) AS bot_handled,
          (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms)
             FROM wa_messages WHERE sender = 'bot' AND latency_ms IS NOT NULL AND created_at >= ${start}) AS median_reply_ms
    `);
    const r = (res.rows ?? res)[0];
    return {
        conversationsToday: r.total,
        needsYou: r.needs_human,
        botHandledPct: r.total ? Math.round((r.bot_handled / r.total) * 100) : 0,
        medianReplyMs: r.median_reply_ms == null ? null : Math.round(Number(r.median_reply_ms)),
    };
}

module.exports = {
    InboxError,
    STATUSES,
    toContactDto,
    toMessageDto,
    getContact,
    upsertInboundContact,
    listContacts,
    setStatus,
    flagContact,
    logMessage,
    getRecentMessages,
    getMessages,
    sendOutbound,
    sendStaffMessage,
    updateDeliveryStatuses,
    handleUnsupportedMedia,
    getStats,
};