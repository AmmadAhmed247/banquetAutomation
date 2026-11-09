const express = require("express");
const router = express.Router();
const { exportCashflowPdf } = require("../controllers/cashflowPdf.controller");

router.get("/", exportCashflowPdf);

module.exports = router;