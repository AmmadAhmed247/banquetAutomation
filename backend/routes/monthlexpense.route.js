const express = require("express");
const router = express.Router();
const {
    GetMonthlyExpenses,
    AddMonthlyExpense,
    DeleteMonthlyExpense,
} = require("../controllers/MonthlyExpense.controller.js");

router.get("/getMonthlyExpenses", GetMonthlyExpenses);
router.post("/addMonthlyExpense", AddMonthlyExpense);
router.delete("/deleteMonthlyExpense/:id", DeleteMonthlyExpense);

module.exports = router;