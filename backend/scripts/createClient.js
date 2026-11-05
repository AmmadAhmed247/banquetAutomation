require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");
const { db } = require("../config/db");
const { clients } = require("../model/schema");

async function main() {
  const { CLIENT_NAME, CLIENT_EMAIL, CLIENT_PHONE, CLIENT_PASSWORD, BANQUET_NAME } = process.env;
  const missing = [
    ["CLIENT_NAME", CLIENT_NAME],
    ["CLIENT_EMAIL", CLIENT_EMAIL],
    ["CLIENT_PHONE", CLIENT_PHONE],
    ["CLIENT_PASSWORD", CLIENT_PASSWORD],
    ["BANQUET_NAME", BANQUET_NAME],
  ].filter(([, value]) => !value);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.map(([key]) => key).join(", ")}`);
  }

  const email = CLIENT_EMAIL.trim().toLowerCase();
  const password = await bcrypt.hash(CLIENT_PASSWORD, 10);
  const clientData = {
    name: CLIENT_NAME.trim(),
    email,
    phone: CLIENT_PHONE.trim(),
    password,
    banquet_name: BANQUET_NAME.trim(),
    role: "admin",
    is_active: true,
  };

  const [existingClient] = await db.select({ id: clients.id }).from(clients).where(eq(clients.email, email));

  if (existingClient) {
    await db.update(clients).set(clientData).where(eq(clients.id, existingClient.id));
    console.log(`Updated client account for ${email}.`);
    return;
  }

  await db.insert(clients).values(clientData);
  console.log(`Created client account for ${email}.`);
}

main()
  .catch((error) => {
    console.error("Could not create client account:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
