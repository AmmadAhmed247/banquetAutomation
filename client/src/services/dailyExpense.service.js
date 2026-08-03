import axios from "axios";
// Adjust the URL to your actual API path
import api from "../api/api";

const dailyExpenseService = {
    getAll: async () => {
        const res = await api.get(API_URL);
        return res.data;
    },
    create: async (data) => {
        const res = await api.post(API_URL, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`${API_URL}/${id}`);
        return res.data;
    }
};

export default dailyExpenseService;