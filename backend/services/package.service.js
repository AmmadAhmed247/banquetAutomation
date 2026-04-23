const { db } = require("../config/db");
const {eq} = require("drizzle-orm")
const { packages } = require("../model/schema");

async function getAllPackages() {
  return await db.select().from(packages);
}

async function createPackage(package_name, time, price){
    try {
      const existingPackage = await db
      .select()
      .from(packages)
      .where(eq(packages.package_name, package_name))
      .limit(1)
      .then(r => r[0])

      if(existingPackage){
        return {
          success: false,
          message: "Package Already Exists!"
        }
      }

      const [newPackage] = await db
      .insert(packages)
      .values({
        package_name: package_name,
        time: time,
        price: price
      })
      .returning()

      return {
        success: true,
        newPackage
      }

    } catch (error) {
      console.log("An Error Occured: ", error)
    }
}

module.exports = { getAllPackages, createPackage };