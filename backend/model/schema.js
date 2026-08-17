const { pgTable, integer, serial, varchar, text, timestamp, numeric, time, boolean, date } = require("drizzle-orm/pg-core");


const user = pgTable("users", {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", {length: 100}),
    phone: text("phone").notNull().unique(),
    last_inbound_at: timestamp("last_inbound_at"),
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
  advance_amount: numeric("advance_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  advance_paid:numeric("advance_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  advance_due_date:timestamp("advance_due_date"), 
  payment_method: varchar("payment_method", { length: 50 }).notNull().default("Cash"),
  payment_note:varchar("payment_note", { length: 255 }),
 
  // Timestamps
  created_at:timestamp("created_at").defaultNow(),
  updated_at:timestamp("updated_at").defaultNow(),
  time_slot: varchar("time_slot", { length: 20 }).default("Night"),   
  bank_name: varchar("bank_name", { length: 50 }),

    // Receipt
  r_no: varchar("r_no", { length: 50 }).unique(),


    // Reminder tracking
  booking_reminder_sent: boolean("booking_reminder_sent").default(false),
  resource_reminder_sent: boolean("resource_reminder_sent").default(false),
  last_advance_reminder_at: timestamp("last_advance_reminder_at"),
});

const packages = pgTable("packages", {
    id: serial("id").primaryKey().notNull(),
    package_name: varchar("package_name", {length: 100}).notNull(),
    time: time("event_time").notNull(),
    price: integer("package_price").notNull()
})


const clients=pgTable("clients",{
    id:serial("id").primaryKey().notNull().unique(),
    name:varchar("name",{length:100}).notNull().unique(),
    email:varchar("email",{length:100}).notNull().unique(),
    phone:varchar("phone",{length:11}).notNull().unique(),
    password:varchar("password").notNull(),
    banquet_name:varchar("banquet_name").notNull(),
    role: varchar("role", { length: 20 }).default("admin"),
    is_active:boolean("is_active").default(true),
    created_at:timestamp("created_at").defaultNow()

})

const dailyExpenses = pgTable("daily_expenses", {
    id: serial("id").primaryKey().notNull(),
    date: date("date").notNull(),
    label: text("label").notNull(),
    category: text("category").notNull(),
    amount: numeric("amount").notNull()
})

const expenses = pgTable("expenses", {
    id: serial("id").primaryKey().notNull(),
    bookingId: integer("booking_id").notNull().references(() => booking.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 100 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    created_at: timestamp("created_at").defaultNow(),
});

const addons = pgTable("addons", {
    id: serial("id").primaryKey().notNull(),
    bookingId: integer("booking_id").notNull().references(() => booking.id, { onDelete: "cascade" }),
    service: varchar("service", { length: 100 }).notNull(), // Dance Floor, Decoration, Pepsi Co., etc.
    client_price: numeric("client_price", { precision: 12, scale: 2 }).notNull().default("0"),
    vendor_cost: numeric("vendor_cost", { precision: 12, scale: 2 }).notNull().default("0"),
    commission: numeric("commission", { precision: 12, scale: 2 }).notNull().default("0"), // = client_price - vendor_cost
    created_at: timestamp("created_at").defaultNow(),
    description: text("description").notNull().default(""),
    received: boolean("received").notNull().default(false),
    received_at: timestamp("received_at"),
    payment_method: varchar("payment_method", { length: 50 }),
    bank_name: varchar("bank_name", { length: 50 }),
});


const monthlyExpenses = pgTable("monthly_expenses", {
    id: serial("id").primaryKey().notNull(),
    category: varchar("category", { length: 100 }).notNull(), 
    label: varchar("label", { length: 255 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
    month: integer("month").notNull(),   
    year: integer("year").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

const payments = pgTable("payments", {
  id: serial("id").primaryKey().notNull(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => booking.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("Advance"), // 'Advance', 'Settlement', 'Partial'
  payment_method: varchar("payment_method", { length: 50 }).notNull().default("Cash"),
  bank_name: varchar("bank_name", { length: 50 }),
  note: varchar("note", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

module.exports = {
    user,
    booking,
    packages,
    clients,
    expenses,
    addons,
    monthlyExpenses,
    dailyExpenses,
    payments
}