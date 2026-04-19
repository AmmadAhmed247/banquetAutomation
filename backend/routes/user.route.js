const express = require("express")
const { GetOrRegisterUser } = require("../controllers/user.controller")
const router = express.Router()

router.post("/getUser", GetOrRegisterUser)

module.exports = router