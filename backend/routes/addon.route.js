const express = require("express");
const router = express.Router();
const { GetAddons, AddAddon, DeleteAddon , MarkReceived , UpdateAddon} = require("../controllers/Addon.controller");

router.get("/getAddons", GetAddons);
router.post("/addAddon", AddAddon);
router.delete("/deleteAddon/:id", DeleteAddon);
router.patch("/markReceived/:id", MarkReceived);
router.put("/updateAddon/:id", UpdateAddon);


module.exports = router;