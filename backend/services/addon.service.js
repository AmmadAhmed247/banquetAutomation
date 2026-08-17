const { db } = require("../config/db");
const { addons , payments } = require("../model/schema");
const { eq } = require("drizzle-orm");

async function addAddon({ bookingId, service, client_price, vendor_cost , description , received }) {
    // Commission is computed server-side so it can never drift from
    // whatever client_price/vendor_cost the frontend happens to send.
    const commission = Number(client_price || 0) - Number(vendor_cost || 0);

    const [newAddon] = await db
        .insert(addons)
        .values({
            bookingId,
            service,
            client_price: client_price || 0,
            vendor_cost: vendor_cost || 0,
            commission,
            description: description || "",
            received: received || false
        })
        .returning();

    return newAddon;
}

async function GetAllAddons() {
    return db.select().from(addons);
}

async function deleteAddon(id) {
    return db.delete(addons).where(eq(addons.id, id));
}

async function updateAddon(addonId, data) {
  const { service, description, client_price, vendor_cost } = data;

  const updateFields = {};
  if (service !== undefined) updateFields.service = service;
  if (description !== undefined) updateFields.description = description;
  if (client_price !== undefined) updateFields.client_price = client_price;
  if (vendor_cost !== undefined) updateFields.vendor_cost = vendor_cost;

  // Recalculate commission whenever price/cost changes
  if (client_price !== undefined || vendor_cost !== undefined) {
    const [existing] = await db.select().from(addons).where(eq(addons.id, addonId));
    if (!existing) {
      const err = new Error("Addon not found");
      err.status = 404;
      throw err;
    }
    const newClientPrice = client_price !== undefined ? Number(client_price) : Number(existing.client_price);
    const newVendorCost = vendor_cost !== undefined ? Number(vendor_cost) : Number(existing.vendor_cost);
    updateFields.commission = newClientPrice - newVendorCost;
  }

  const [updated] = await db.update(addons)
    .set(updateFields)
    .where(eq(addons.id, addonId))
    .returning();

  return updated;
}

async function markAddonReceived(addonId, { payment_method = "Cash", bank_name = null } = {}) {
  const [addon] = await db.select().from(addons).where(eq(addons.id, addonId));
  if (!addon) {
    const err = new Error("Addon not found");
    err.status = 404;
    throw err;
  }
  if (addon.received) return addon;

  const [updated] = await db.update(addons)
    .set({ received: true, received_at: new Date() })
    .where(eq(addons.id, addonId))
    .returning();

  await db.insert(payments).values({
    bookingId: addon.bookingId,
    amount: addon.client_price,
    type: "Addon",
    payment_method,
    bank_name,
    note: `Add-on: ${addon.service}`,
  });

  return updated;
}
module.exports = { addAddon, deleteAddon, GetAllAddons, markAddonReceived, updateAddon };

