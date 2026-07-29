const express = require("express");
const router = express.Router();
const { GetAddons, AddAddon, DeleteAddon } = require("../controllers/Addon.controller");

router.get("/getAddons", GetAddons);
router.post("/addAddon", AddAddon);
router.delete("/deleteAddon/:id", DeleteAddon);

module.exports = router;