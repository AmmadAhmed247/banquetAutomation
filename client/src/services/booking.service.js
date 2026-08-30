import api from "../api/api";
const bookingService = {

  getAllBookings: async () => {
    try {
      const res = await api.get('/api/booking/allBookings');
      console.log(res);
      
    
      return res.data.bookings || [];
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },
  

  createBooking: async (form) => {
    try {
      const res = await api.post('/api/booking/createBooking', {
        rNo:            form.rNo,
        event:          form.event,
        date:           form.date,
        packageName:    form.package,
        phone:          form.phone,
        client:         form.client,
        guests:         form.guests,
        venue:          form.venue,
        totalAmount:    form.totalAmount,
        advanceAmount:  form.advanceAmount,
        advancePaid:    form.advancePaid,
        advanceDueDate: form.advanceDueDate,   
        paymentMethod:  form.paymentMethod,
        paymentNote:    form.paymentNote,
        timeSlot:       form.timeSlot,
        bankName:       form.bankName,
        status:         form.status,
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
        id:                      form.id,
        rNo:                     form.rNo,
        event:                   form.event,
        date:                    form.date,
        packageName:             form.package,
        phone:                   form.phone,
        client:                  form.client,
        guests:                  form.guests,
        venue:                   form.venue,
        totalAmount:             form.totalAmount,
        advanceAmount:           form.advanceAmount,
        advancePaid:             form.advancePaid,
        advanceDueDate:          form.advanceDueDate,   
        paymentMethod:           form.paymentMethod,
        paymentNote:             form.paymentNote,
        status:                  form.status,
        timeSlot:                form.timeSlot,
        bankName:                form.bankName,
        settlementPaymentMethod: form.settlementPaymentMethod,
        settlementBankName:      form.settlementBankName,
      });
      return res.data;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  },
  deleteBooking: async (id) => {
  try {
    const res = await api.delete('/api/booking/deleteBooking', {
      data: { id }
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
},

submitNote: async ({ bookingId, note, overwrite = false }) => {
  const res = await api.post("/api/booking/note", {
    bookingId,
    note,
    overwrite,
  });
  const data = res.data;
  if (!data.success) throw new Error(data.error);
  return data.booking;
}

};

export default bookingService;