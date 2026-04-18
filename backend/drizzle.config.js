const {defineConfig} = require("drizzle-kit")
const dotenv = require("dotenv")
dotenv.config()

export default defineConfig({
    dialect: "postgresql",
    schema: "./models/schema.js",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL
    },
    verbose: true,
    strict: true
})
