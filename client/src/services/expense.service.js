import api from "../api/api";

const expenseService = {

  getAllExpenses: async () => {
    try {
      const res = await api.get('/api/expense/allExpenses');
      return res.data.expenses || [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  createExpense: async (form) => {
    try {
      const res = await api.post('/api/expense/createExpense', {
        bookingId: form.bookingId,
        category:  form.category,
        label:     form.label,
        amount:    form.amount,
      });
      return res.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  deleteExpense: async (id) => {
  try {
    const res = await api.delete(`/api/expense/deleteExpense/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
},

};

export default expenseService;