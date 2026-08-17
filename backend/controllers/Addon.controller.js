const { addAddon, deleteAddon, GetAllAddons , markAddonReceived , updateAddon } = require("../services/addon.service");

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
        const { bookingId, service, client_price, vendor_cost , description, received } = req.body;
        if (!bookingId || !service || client_price === undefined || vendor_cost === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newAddon = await addAddon({ bookingId, service, client_price, vendor_cost, description, received });
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


async function UpdateAddon(req, res) {
    try {
        const { service, description, client_price, vendor_cost } = req.body;
        const updated = await updateAddon(req.params.id, { service, description, client_price, vendor_cost });
        return res.status(200).json({ success: true, addon: updated });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.message || "Server Error" });
    }
}
async function MarkReceived(req, res) {
    try {
        const { payment_method, bank_name } = req.body;
        const updated = await markAddonReceived(req.params.id, { payment_method, bank_name });
        return res.status(200).json({ success: true, addon: updated });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ success: false, message: error.message || "Server Error" });
    }
}


module.exports = { GetAddons, AddAddon, DeleteAddon , UpdateAddon , MarkReceived };