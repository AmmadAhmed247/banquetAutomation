const { db } = require("../config/db")
const { dailyExpenses } = require("../model/schema")
const { eq } = require("drizzle-orm")


async function createDailyExpense(date, category, label, amount) {
    try {
        const newExpense = await db
        .insert(dailyExpenses)
        .values({
            date: date,
            category: category,
            label: label,
            amount: amount
        })
        .returning()
        
       return newExpense

    } catch (error) {
        console.log("Error", error)
    }
}

async function DeleteDailyExpense(expenseId) {
    try {
        return await db
        .delete(dailyExpenses)
        .where(eq(dailyExpenses.id, expenseId))
        .returning()
    } catch (error) {
        console.log("Error", error)
    }
}

async function GetAllDailyExpenses() {
    try {
        return await db
        .select()
        .from(dailyExpenses)
    } catch (error) {
        console.log("error", error)
    }
}

module.exports = {
    createDailyExpense,
    DeleteDailyExpense,
    GetAllDailyExpenses
}