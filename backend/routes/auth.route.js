
const express = require("express");
const router = express.Router();
const { login, logout, me } = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, me); 
module.exports = router;