const express = require("express");
const router = express.Router();
const { GetAddons, AddAddon, DeleteAddon , MarkReceived , UpdateAddon} = require("../controllers/Addon.controller");
const { markAddonReceived } = require("../services/addon.service");

router.get("/getAddons", GetAddons);
router.post("/addAddon", AddAddon);
router.delete("/deleteAddon/:id", DeleteAddon);
router.patch('/markReceived/:id', async (req, res) => {
  try {
    const updatedAddon = await markAddonReceived(req.params.id, req.body);

    res.json({ success: true, addon: updatedAddon }); 
    console.log(updatedAddon);
    
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});
router.put("/updateAddon/:id", UpdateAddon);


module.exports = router;