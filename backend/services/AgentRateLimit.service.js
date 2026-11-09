const { and, eq, or, sql } = require("drizzle-orm");
const { db } = require("../config/db");
const { agentUsage } = require("../model/schema");

const WINDOW_MS = 10 * 60 * 1000;
const KARACHI_OFFSET_MS = 5 * 60 * 60 * 1000;

function positiveIntegerEnv(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw === "") return fallback;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new Error(`${name} must be a positive integer`);
    }
    return value;
}

const limits = {
    contactWindow: positiveIntegerEnv("GEMINI_RATE_LIMIT_PER_CONTACT_10M", 20),
    contactDaily: positiveIntegerEnv("GEMINI_RATE_LIMIT_PER_CONTACT_DAILY", 100),
    globalDaily: positiveIntegerEnv("GEMINI_RATE_LIMIT_GLOBAL_DAILY", 1000),
    inboundMessagesDaily: positiveIntegerEnv("WHATSAPP_MAX_MESSAGES_PER_CONTACT_DAILY", 150),
};

function karachiDayStart(now) {
    const localNow = new Date(now.getTime() + KARACHI_OFFSET_MS);
    localNow.setUTCHours(0, 0, 0, 0);
    return new Date(localNow.getTime() - KARACHI_OFFSET_MS);
}

async function reserveUsageWindows(usageWindows) {
    const now = new Date();
    const dayStart = karachiDayStart(now);
    return db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(184722904, 1)`);
        await tx.delete(agentUsage).where(sql`${agentUsage.windowStart} < ${dayStart}`);

        const existing = await tx
            .select({ scopeKey: agentUsage.scopeKey, windowStart: agentUsage.windowStart, requestCount: agentUsage.requestCount })
            .from(agentUsage)
            .where(or(...usageWindows.map(({ scopeKey, windowStart }) =>
                and(eq(agentUsage.scopeKey, scopeKey), eq(agentUsage.windowStart, windowStart))
            )));
        const counts = new Map(existing.map((row) => [
            `${row.scopeKey}:${row.windowStart.getTime()}`,
            row.requestCount,
        ]));

        if (usageWindows.some(({ scopeKey, windowStart, limit }) =>
            (counts.get(`${scopeKey}:${windowStart.getTime()}`) ?? 0) >= limit
        )) {
            return false;
        }

        await tx
            .insert(agentUsage)
            .values(usageWindows.map(({ scopeKey, windowStart }) => ({
                scopeKey,
                windowStart,
                requestCount: 1,
            })))
            .onConflictDoUpdate({
                target: [agentUsage.scopeKey, agentUsage.windowStart],
                set: { requestCount: sql`${agentUsage.requestCount} + 1` },
            });

        return true;
    });
}

async function reserveAgentRequest(contactId) {
    const now = new Date();
    const dayStart = karachiDayStart(now);
    const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
    return reserveUsageWindows([
        { scopeKey: "global-daily", windowStart: dayStart, limit: limits.globalDaily },
        { scopeKey: `contact-daily:${contactId}`, windowStart: dayStart, limit: limits.contactDaily },
        { scopeKey: `contact-10m:${contactId}`, windowStart, limit: limits.contactWindow },
    ]);
}

async function reserveInboundMessage(contactId) {
    const dayStart = karachiDayStart(new Date());
    return reserveUsageWindows([{
        scopeKey: `inbound-daily:${contactId}`,
        windowStart: dayStart,
        limit: limits.inboundMessagesDaily,
    }]);
}

module.exports = { reserveAgentRequest, reserveInboundMessage };
