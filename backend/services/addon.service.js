const { db } = require("../config/db");
const { addons, booking } = require("../model/schema");
const { eq, sql } = require("drizzle-orm");

async function addAddon({ bookingId, service, client_price, vendor_cost, description }) {
  const clientPrice = Number(client_price || 0);
  const vendorCost = Number(vendor_cost || 0);

  return db.transaction(async (tx) => {
    const [newAddon] = await tx
      .insert(addons)
      .values({
        bookingId,
        service,
        client_price: clientPrice,
        vendor_cost: vendorCost,
        commission: clientPrice - vendorCost,
        description: description || "",
      })
      .returning();

    await tx.update(booking)
      .set({
        total_amount: sql`${booking.total_amount} + ${clientPrice.toFixed(2)}`,
        updated_at: new Date(),
      })
      .where(eq(booking.id, bookingId));

    return newAddon;
  });
}

async function GetAllAddons() {
  return db.select().from(addons);
}

async function deleteAddon(id) {
  const addonId = Number(id);

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(addons).where(eq(addons.id, addonId));
    if (!existing) return tx.delete(addons).where(eq(addons.id, addonId));

    const result = await tx.delete(addons).where(eq(addons.id, addonId));
    await tx.update(booking)
      .set({
        total_amount: sql`${booking.total_amount} - ${Number(existing.client_price || 0).toFixed(2)}`,
        updated_at: new Date(),
      })
      .where(eq(booking.id, existing.bookingId));

    return result;
  });
}

async function updateAddon(addonId, data) {
  const id = Number(addonId);
  const { service, description, client_price, vendor_cost } = data;

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(addons).where(eq(addons.id, id));
    if (!existing) {
      const err = new Error("Addon not found");
      err.status = 404;
      throw err;
    }

    const newClientPrice = client_price !== undefined ? Number(client_price) : Number(existing.client_price);
    const newVendorCost = vendor_cost !== undefined ? Number(vendor_cost) : Number(existing.vendor_cost);
    const updateFields = {
      commission: newClientPrice - newVendorCost,
    };
    if (service !== undefined) updateFields.service = service;
    if (description !== undefined) updateFields.description = description;
    if (client_price !== undefined) updateFields.client_price = newClientPrice;
    if (vendor_cost !== undefined) updateFields.vendor_cost = newVendorCost;

    const [updated] = await tx.update(addons)
      .set(updateFields)
      .where(eq(addons.id, id))
      .returning();

    const priceDelta = newClientPrice - Number(existing.client_price || 0);
    if (priceDelta !== 0) {
      await tx.update(booking)
        .set({
          total_amount: sql`${booking.total_amount} + ${priceDelta.toFixed(2)}`,
          updated_at: new Date(),
        })
        .where(eq(booking.id, existing.bookingId));
    }

    return updated;
  });
}

module.exports = { addAddon, deleteAddon, GetAllAddons, updateAddon };