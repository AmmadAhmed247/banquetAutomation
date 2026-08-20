import api from "../api/api"; 

const paymentService = {
  getAll: async () => {
    const res = await api.get("api/payments");
    return res.data; 
  },
  getByBooking: async (bookingId) => {
    const res = await api.get(`api/payments/booking/${bookingId}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("api/payments", data);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`api/payments/${id}`);
    return res.data;
  },
};

export default paymentService;