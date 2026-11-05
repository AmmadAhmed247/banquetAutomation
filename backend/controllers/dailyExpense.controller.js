const { createDailyExpense, GetAllDailyExpenses, DeleteDailyExpense } = require("../services/dailyExpense.service")

async function allDailyExpenses(req, res) {
    try {
        const monthlyExpense = await GetAllDailyExpenses()

        return res.status(200).json(monthlyExpense)

    } catch (error) {
        console.log("error", error)
        return res.status(500).json({
            message: "Invalid Request!"
        })
    }
}

async function createExpense(req, res) {
    try {
        const { date, category, label, amount } = req.body

        if (!date || !category || !label || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Date, category, label, and a positive amount are required."
            })
        }

        const result = await createDailyExpense(date, category, label, amount)

        return res.status(200).json(result)

    } catch (error) {
        console.log("error", error)
        return res.status(500).json({
            message: "Invalid Request!"
        })
    }
}

async function deleteExpense(req, res) {
    try {
        const { id } = req.params

        const result = await DeleteDailyExpense(id)

        return res.status(200).json(result)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({
            message: "Invalid Request!"
        })
    }
}

module.exports = {
    allDailyExpenses,
    createExpense,
    deleteExpense
}