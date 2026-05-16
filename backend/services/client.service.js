const { eq } = require("drizzle-orm")
const {db} = require("../config/db")
const { clients } = require("../model/schema")
const bcrypt = require("bcrypt");


//create client
const createClient = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);
  const result = await db.insert(clients).values({ ...data, password: hashed }).returning();
  return result[0];
};


const getAllClients=async()=>{
    return await db.select().from(clients);
}

const getClientById = async (id) => {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id));

  return result[0];
};

const updateClient = async (id, data) => {
  const result = await db
    .update(clients)
    .set(data)
    .where(eq(clients.id, id))
    .returning();

  return result[0];
};

const deleteClient = async (id) => {
  return await db
    .delete(clients)
    .where(eq(clients.id, id))
    .returning();
};

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};