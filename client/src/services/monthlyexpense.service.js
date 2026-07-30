import api from "../api/api";

const monthlyExpenseService = {
  getAll: async () => {
    const res = await api.get("/api/monthlyexpense/getMonthlyExpenses");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/api/monthlyexpense/addMonthlyExpense", data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/api/monthlyexpense/deleteMonthlyExpense/${id}`);
    return res.data;
  },
};

export default monthlyExpenseService;