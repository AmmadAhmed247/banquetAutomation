const { db } = require("../config/db");
const { addons, payments } = require("../model/schema");
const { eq, and } = require("drizzle-orm");

async function addAddon({ bookingId, service, client_price, vendor_cost, description }) {
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
            received: false,
            received_at: null
        })
        .returning();

    return newAddon;
}

async function GetAllAddons() {
    return db.select().from(addons);
}

async function deleteAddon(id) {
    const addonId = Number(id);
    
    // Fetch the addon first so we know its details for cleanup
    const [existing] = await db.select().from(addons).where(eq(addons.id, addonId));
    if (existing) {
        // Remove the corresponding payment entry from cash flow if it exists
        await db.delete(payments)
            .where(
                and(
                    eq(payments.bookingId, existing.bookingId),
                    eq(payments.note, `Add-on: ${existing.service}`)
                )
            );
    }

    return db.delete(addons).where(eq(addons.id, addonId));
}

async function updateAddon(addonId, data) {
  const id = Number(addonId);
  const { service, description, client_price, vendor_cost, received } = data;

  const updateFields = {};
  if (service !== undefined) updateFields.service = service;
  if (description !== undefined) updateFields.description = description;
  if (client_price !== undefined) updateFields.client_price = client_price;
  if (vendor_cost !== undefined) updateFields.vendor_cost = vendor_cost;
  if (received !== undefined) updateFields.received = received;

  if (client_price !== undefined || vendor_cost !== undefined) {
    const [existing] = await db.select().from(addons).where(eq(addons.id, id));
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
    .where(eq(addons.id, id))
    .returning();

  return updated;
}

async function markAddonReceived(addonId, payload = {}) {
  const { received = true, payment_method = "Cash", bank_name = null } = payload;
  const id = Number(addonId);

  const [addon] = await db.select().from(addons).where(eq(addons.id, id));
  if (!addon) {
    const err = new Error("Addon not found");
    err.status = 404;
    throw err;
  }

  if (received === false) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(addons)
        .set({
          received: false,
          received_at: null,
          payment_method: "",
          bank_name: null
        })
        .where(eq(addons.id, id))
        .returning();

      await tx.delete(payments)
        .where(
          and(
            eq(payments.bookingId, addon.bookingId),
            eq(payments.note, `Add-on #${addon.id}: ${addon.service}`)
          )
        );

      return updated;
    });
  }

  if (addon.received) return addon;

  const paymentDate = new Date();

  return await db.transaction(async (tx) => {
    const [updated] = await tx.update(addons)
      .set({
        received: true,
        received_at: paymentDate,
        payment_method,
        bank_name
      })
      .where(eq(addons.id, id))
      .returning();

    await tx.insert(payments).values({
      bookingId: addon.bookingId,
      amount: addon.client_price,
      flow: "IN",
      category: "Addon",
      payment_method,
      bank_name,
      note: `Add-on #${addon.id}: ${addon.service}`,
      created_at: paymentDate
    });

    return updated;
  });
}

module.exports = { addAddon, deleteAddon, GetAllAddons, markAddonReceived, updateAddon };