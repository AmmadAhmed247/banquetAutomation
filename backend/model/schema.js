const {pgTable, integer, serial,varchar, text, timestamp , numeric, time} = require("drizzle-orm/pg-core")

const user = pgTable("users", {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", {length: 100}),
    phone: text("phone").notNull().unique(),
    created_at: timestamp("created_at").defaultNow()
})
const booking = pgTable("bookings", {
  id:serial("id").primaryKey().notNull(),
  userId:integer("user_id").references(() => user.id),
 
  // Client Info
  client:varchar("client", { length: 150 }).notNull(),
  phone:varchar("phone", { length: 50 }).notNull(),
  guests:integer("guests").notNull().default(0),
 
  // Event Details
  date:timestamp("date", { length: 50 }).notNull(),
  event:varchar("event", { length: 100 }).notNull(),
  package_name:varchar("package_name", { length: 100 }).notNull(),
  venue:varchar("venue", { length: 100 }).notNull(),
  status:varchar("status", { length: 50 }).notNull().default("Pending"),
 
  // Payment Details
  total_amount:numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  advance_paid:numeric("advance_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  payment_method: varchar("payment_method", { length: 50 }).notNull().default("Cash"),
  payment_note:varchar("payment_note", { length: 255 }),
 
  // Timestamps
  created_at:timestamp("created_at").defaultNow(),
  updated_at:timestamp("updated_at").defaultNow(),
});

const packages = pgTable("packages", {
    id: serial("id").primaryKey().notNull(),
    package_name: varchar("package_name", {length: 100}).notNull(),
    time: time("event_time").notNull(),
    price: integer("package_price").notNull()
})

module.exports = {
    user,
    booking,
    packages
}