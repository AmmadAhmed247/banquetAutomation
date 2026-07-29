const { addAddon, deleteAddon, GetAllAddons } = require("../services/addon.service");

async function GetAddons(req, res) {
    try {
        const addons = await GetAllAddons();
        return res.status(200).json({ success: true, addons });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function AddAddon(req, res) {
    try {
        const { bookingId, service, client_price, vendor_cost } = req.body;
        if (!bookingId || !service || client_price === undefined || vendor_cost === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newAddon = await addAddon({ bookingId, service, client_price, vendor_cost });
        return res.status(201).json({ success: true, data: newAddon });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function DeleteAddon(req, res) {
    try {
        await deleteAddon(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = { GetAddons, AddAddon, DeleteAddon };