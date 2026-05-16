
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
const { clients } = require("../model/schema");
const { eq } = require("drizzle-orm");

const loginClient = async ({ email, password }) => {
  const result = await db.select().from(clients).where(eq(clients.email, email));
  const client = result[0];
  if (!client) throw new Error("Invalid credentials");
  if (!client.is_active) throw new Error("Account is inactive");

  const match = await bcrypt.compare(password, client.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: client.id, role: client.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _, ...clientData } = client;
  return { token, client: clientData };
};
module.exports = { loginClient };