const { db } = require('../config/db')
const { expenses } = require("../model/schema");
const { eq } = require("drizzle-orm");


async function GetAllExpenses() {
    try {
        return await db.select().from(expenses)
    } catch (error) {
        console.log("Error While Fetching Expenses: ", error)
    }
}

async function addExpense({ bookingId, category, label, amount }) {
    try {
        const [newExpense] = await db
            .insert(expenses)
            .values({ bookingId, category, label, amount })
            .returning();
        return newExpense;
    } catch (error) {
        console.log("Error While Adding Expense: ", error)
    }
}

async function deleteExpense(id) {
    await db.delete(expenses).where(eq(expenses.id, id));
}

module.exports = {
    GetAllExpenses,
    addExpense,
    deleteExpense
}