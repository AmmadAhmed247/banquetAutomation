import axios from "axios";
// Adjust the URL to your actual API path
import api from "../api/api";

const dailyExpenseService = {
    getAll: async () => {
        const res = await api.get("/api/dailyExpense/allDailyExpense");
        return res.data;
    },
    create: async (data) => {
        const res = await api.post("/api/dailyExpense/createExpense", data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/api/dailyExpense/deleteExpense/${id}`);
        return res.data;
    }
};

export default dailyExpenseService;