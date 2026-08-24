const { db } = require("../config/db");
const { clients } = require("../model/schema");
const bcrypt =require('bcrypt')

async function createNewClient(data) {
    try {
        const hashedPassword=await bcrypt.hash(data.passwordRaw , 10);


        const [newClient]=await db.insert(clients).values({
            name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        banquet_name: data.banquetName,
        role: data.role || 'admin',
        is_active: data.isActive !== undefined ? data.isActive : true,
        }).returning();


        console.log("client created ... " , newClient);

        return newClient


    } catch (error) {
        console.log(error.message);
        throw error;

        
    }
}


async function main() {
  await createNewClient({
    name: 'Ammad',
    email: 'ammad@gmail.com',
    phone: '03001234567',
    passwordRaw: 'ammad123@',
    banquetName: 'Royal Palace Banquet',
  });

  process.exit(0);
}


main();