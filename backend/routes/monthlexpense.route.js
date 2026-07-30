const express = require("express");
const router = express.Router();
const {
    GetMonthlyExpenses,
    AddMonthlyExpense,
    DeleteMonthlyExpense,
} = require("../controllers/MonthlyExpense.controller.js");

router.get("/getmonthlyexpenses", GetMonthlyExpenses);
router.post("/addmonthlyexpense", AddMonthlyExpense);
router.delete("/deletemonthlyexpense/:id", DeleteMonthlyExpense);

module.exports = router;