const express = require("express");
const router = express.Router();
const c = require("../controllers/Inbox.controller");


router.get("/stats", c.getStats);
router.get("/stream", c.stream);
router.get("/contacts", c.listContacts);
router.get("/contacts/:id/messages", c.getMessages);
router.post("/contacts/:id/send", c.sendMessage);
router.post("/contacts/:id/status", c.updateStatus);

module.exports = router;