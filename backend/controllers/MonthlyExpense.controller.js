const {
    addMonthlyExpense,
    GetAllMonthlyExpenses,
    deleteMonthlyExpense,
} = require("../services/monthlyexpense.service");

async function GetMonthlyExpenses(req, res) {
    try {
        const monthlyExpenses = await GetAllMonthlyExpenses();
        return res.status(200).json({ success: true, monthlyExpenses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function AddMonthlyExpense(req, res) {
    try {
        const { category, label, amount, month, year } = req.body;
        if (!category || !label || amount === undefined || month === undefined || year === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newExpense = await addMonthlyExpense({ category, label, amount, month, year });
        return res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function DeleteMonthlyExpense(req, res) {
    try {
        await deleteMonthlyExpense(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = { GetMonthlyExpenses, AddMonthlyExpense, DeleteMonthlyExpense };