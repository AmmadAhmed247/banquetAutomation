const express = require("express")
const router = express.Router()
const {createExpense, deleteExpense, allDailyExpenses} = require("../controllers/dailyExpense.controller")

router.post("/createExpense", createExpense)
router.post("/deleteExpense/:id", deleteExpense)
router.get("/allDailyExpense", allDailyExpenses)

module.exports = router