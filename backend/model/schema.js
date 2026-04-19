const {pgTable, integer, serial,varchar, text, timestamp} = require("drizzle-orm/pg-core")

const user = pgTable("users", {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", {length: 100}).default("New User").notNull(),
    phone: text("phone").notNull().unique(),
    created_at: timestamp("created_at").defaultNow()
})

const booking = pgTable("bookings", {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").references(()=> user.id),
    date: varchar("date", {length: 50}).notNull(),
    event: varchar("event", {length: 100}).notNull(),
    status: varchar("status", {length: 50}).default("pending").notNull(),
    package_name: varchar("package_name", {length: 100}).notNull(),
    phone: varchar("phone", {length: 100}).notNull(),
    created_at: timestamp("created_at").defaultNow()
})

const packages = pgTable("packages", {
    id: serial("id").primaryKey().notNull(),
    package_name: varchar("package_name", {length: 100}).notNull(),
    time: timestamp("event_time").notNull(),
    price: integer("package_price").notNull()
})

module.exports = {
    user,
    booking,
    packages
}