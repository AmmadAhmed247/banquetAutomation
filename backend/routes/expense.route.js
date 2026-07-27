const express = require("express");
const router = express.Router();
const { GetExpenses, AddExpense, DeleteExpense } = require("../controllers/expense.controller");

router.get("/allExpenses", GetExpenses);
router.post("/createExpense", AddExpense);
router.delete("/deleteExpense/:id", DeleteExpense);

module.exports = router;