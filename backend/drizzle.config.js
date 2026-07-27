const { defineConfig } = require("drizzle-kit")
const dotenv = require("dotenv")
dotenv.config()

module.exports = defineConfig({
    dialect: "postgresql",
    schema: "./model/schema.js",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true
})