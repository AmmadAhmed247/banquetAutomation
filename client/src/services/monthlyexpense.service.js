import api from "../api/api";

const monthlyExpenseService = {
  getAll: async () => {
    const res = await api.get("api/monthlyExpense/getMonthlyExpenses");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("api/monthlyExpense/addMonthlyExpense", data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`api/monthlyExpense/deleteMonthlyExpense/${id}`);
    return res.data;
  },
};

export default monthlyExpenseService;