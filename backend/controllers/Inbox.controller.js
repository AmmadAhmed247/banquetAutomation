const inbox = require("../services/Inbox.service");
const { addClient } = require("../utils/inboxEvents");

const handle = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        const status = err.status ?? 500;
        if (status >= 500) console.error("[inbox]", err);
        res.status(status).json({ error: status >= 500 ? "Something went wrong" : err.message });
    }
};

const parseId = (req) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new inbox.InboxError("Invalid id");
    return id;
};

const getStats = handle(async (_req, res) => res.json(await inbox.getStats()));

const listContacts = handle(async (req, res) =>
    res.json(await inbox.listContacts({ status: req.query.status, q: req.query.q }))
);

const getMessages = handle(async (req, res) => {
    const id = parseId(req);
    await inbox.getContact(id); // 404 if missing
    res.json(await inbox.getMessages(id));
});

const sendMessage = handle(async (req, res) =>
    res.status(201).json(await inbox.sendStaffMessage(parseId(req), req.body?.text))
);

const updateStatus = handle(async (req, res) => {
    const contact = await inbox.setStatus(parseId(req), req.body?.status);
    res.json(inbox.toContactDto(contact));
});

function stream(req, res) {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // stops nginx from buffering the stream
    });
    res.flushHeaders();
    res.write("retry: 5000\n\n");
    addClient(res);
    const ping = setInterval(() => res.write(": ping\n\n"), 25000);
    req.on("close", () => clearInterval(ping));
}

module.exports = { getStats, listContacts, getMessages, sendMessage, updateStatus, stream };