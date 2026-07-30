const {db} = require("../config/db");
const { monthlyExpenses } = require("../model/schema");
const { eq, and } = require("drizzle-orm");

async function addMonthlyExpense({ category, label, amount, month, year }) {
    const [newExpense] = await db
        .insert(monthlyExpenses)
        .values({
            category,
            label,
            amount: amount || 0,
            month,
            year,
        })
        .returning();

    return newExpense;
}

async function GetAllMonthlyExpenses() {
    return db.select().from(monthlyExpenses);
}

async function GetMonthlyExpensesForPeriod(month, year) {
    return db
        .select()
        .from(monthlyExpenses)
        .where(and(eq(monthlyExpenses.month, month), eq(monthlyExpenses.year, year)));
}

async function deleteMonthlyExpense(id) {
    return db.delete(monthlyExpenses).where(eq(monthlyExpenses.id, id));
}

module.exports = {
    addMonthlyExpense,
    GetAllMonthlyExpenses,
    GetMonthlyExpensesForPeriod,
    deleteMonthlyExpense,
};