const express = require("express");
const router = express.Router();
const { getCashflow } = require("../controllers/cashflow.controller");

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/", getCashflow);

module.exports = router;
