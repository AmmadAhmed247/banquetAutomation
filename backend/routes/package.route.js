const express = require("express")
const { createNewPackage } = require("../controllers/package.controller")
const router =express.Router()

router.post("/create", createNewPackage)

module.exports = router