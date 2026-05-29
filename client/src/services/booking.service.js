import api from "../api/api";
const bookingService = {

  getAllBookings: async () => {
    try {
      const res = await api.get('/api/booking/allBookings');
    
      return res.data.bookings || [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },
  

  createBooking: async (form) => {
    try {
      const res = await api.post('/api/booking/createBooking', {
        event:         form.event,
        date:          form.date,
        packageName:   form.package,
        phone:         form.phone,
        client:        form.client,
        guests:        form.guests,
        venue:         form.venue,
        totalAmount:   form.totalAmount,
        advancePaid:   form.advancePaid,
        paymentMethod: form.paymentMethod,
        paymentNote:   form.paymentNote,
        status:        form.status,
      });
      return res.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  updateBooking: async (form) => {
    try {
      const res = await api.put('/api/booking/updateBooking', {
        id:            form.id,
        event:         form.event,
        date:          form.date,
        packageName:   form.package,
        phone:         form.phone,
        client:        form.client,
        guests:        form.guests,
        venue:         form.venue,
        totalAmount:   form.totalAmount,
        advancePaid:   form.advancePaid,
        paymentMethod: form.paymentMethod,
        paymentNote:   form.paymentNote,
        status:        form.status,
      });
      return res.data;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  },

};

export default bookingService;