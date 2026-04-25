const express = require("express")
const { GetOrRegisterUser, fetchAllUsers } = require("../controllers/user.controller")
const router = express.Router()

router.post("/getUser", GetOrRegisterUser)
router.get("/fetchUsers", fetchAllUsers)


module.exports = router