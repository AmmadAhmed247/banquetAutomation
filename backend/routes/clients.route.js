const express = require("express");
const router = express.Router();

const {getAllClients , createClient , getClientById , updateClient , deleteClient } = require("../controllers/clients.controller");

// CREATE
router.post("/", createClient);

// GET ALL
router.get("/", getAllClients);

// GET ONE
router.get("/:id", getClientById);

// UPDATE
router.put("/:id", updateClient);

// DELETE
router.delete("/:id", deleteClient);

module.exports = router;