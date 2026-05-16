const clientService = require("../services/client.service");

// CREATE
const createClient = async (req, res) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
const getAllClients = async (req, res) => {
  try {
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
const getClientById = async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) return res.status(404).json({ message: "Not found" });

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
const updateClient = async (req, res) => {
  try {
    const updated = await clientService.updateClient(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deleteClient = async (req, res) => {
  try {
    await clientService.deleteClient(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};