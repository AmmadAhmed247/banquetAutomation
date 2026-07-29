const { db } = require("../config/db");
const { addons } = require("../model/schema");
const { eq } = require("drizzle-orm");

async function addAddon({ bookingId, service, client_price, vendor_cost }) {
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

module.exports = { addAddon, GetAllAddons, deleteAddon };