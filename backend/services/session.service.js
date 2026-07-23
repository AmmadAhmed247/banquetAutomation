const { db } = require("../config/db");
const { user } = require("../model/schema");
const { eq } = require("drizzle-orm");

const sessions = new Map()

function getSession(phone){
    return sessions.get(phone) || null
}

function setSession(phone, data){
    sessions.set(phone,data)
}

function clearSession(phone) {
  sessions.delete(phone);
}

let activeHandoffCustomer = null;

function getActiveHandoffCustomer() {
    return activeHandoffCustomer;
}

function setActiveHandoffCustomer(phone) {
    activeHandoffCustomer = phone;
}

function clearActiveHandoffCustomer() {
    activeHandoffCustomer = null;
}
async function updateLastInbound(phone) {
  try {
    await db.update(user)
      .set({ last_inbound_at: new Date() })
      .where(eq(user.phone, phone));
  } catch (err) {
    console.error("updateLastInbound failed:", err.message);
  }
}

async function getUserByPhone(phone) {
  const [u] = await db.select().from(user).where(eq(user.phone, phone));
  return u;
}

function isWithinWindow(lastInboundAt) {
  if (!lastInboundAt) return false;
  return (Date.now() - new Date(lastInboundAt).getTime()) < 24 * 60 * 60 * 1000;
}


module.exports = {
    getSession,
    setSession,
    updateLastInbound,
    isWithinWindow,
    getUserByPhone,
    clearSession,
    getActiveHandoffCustomer,
    setActiveHandoffCustomer,
    clearActiveHandoffCustomer
}