const { addExpense, deleteExpense, GetAllExpenses } = require("../services/expense.service");

async function GetExpenses(req, res) {
    try {
        const expenses = await GetAllExpenses();
        return res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function AddExpense(req, res) {
    try {
        const { bookingId, category, label, amount } = req.body;
        if (!bookingId || !category || !label || !amount) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const newExpense = await addExpense({ bookingId, category, label, amount });
        return res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

async function DeleteExpense(req, res) {
    try {
        await deleteExpense(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = { GetExpenses, AddExpense, DeleteExpense };