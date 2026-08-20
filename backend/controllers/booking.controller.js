const {
  CreateBooking,
  GetAllBookings,
  GetAllBookingsUnfiltered,
  UpdateBooking,
  DeleteBooking,
} = require("../services/booking.service");

async function CreateUserBooking(req, res) {
  try {
    const {
      rNo,
      event,
      date,
      packageName,
      phone,
      client,
      guests,
      venue,
      totalAmount,
      advanceAmount,
      advancePaid,
      advanceDueDate,
      paymentMethod,
      paymentNote,
      status,
      timeSlot,
      bankName,
    } = req.body;

    console.log("Create Booking Request body:", req.body);

    if (!event || !packageName || !date || !phone || !client || !venue) {
      return res.status(400).json({
        message: "Missing required fields: event, date, packageName, phone, client, venue!",
      });
    }

    const result = await CreateBooking({
      rNo: rNo || null,
      event,
      date,
      packageName,
      phone,
      client,
      guests: guests || 0,
      venue,
      totalAmount: totalAmount || 0,
      totalAdvanceAmount: advanceAmount || 0,
      advancePaid: advancePaid || 0,
      advanceDueDate: advanceDueDate || null,
      paymentMethod: paymentMethod || "Cash",
      paymentNote: paymentNote || "",
      status: status || "Pending",
      timeSlot: timeSlot || "Night",
      bankName: bankName || null,
    });

    if (!result?.success) {
      return res.status(401).json(result || { message: "Failed to create booking" });
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error?.code === "23505" && error?.constraint?.includes("r_no")) {
      return res.status(409).json({
        message: "That receipt number (R.No.) is already in use on another booking.",
      });
    }
    console.log("Error In Booking Creation (Controller): ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function GetAllUserBookings(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    const result = await GetAllBookings(phone);
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error In Getting Bookings (Controller): ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function GetAllBookingsAdmin(req, res) {
  try {
    const result = await GetAllBookingsUnfiltered();
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error In Getting All Bookings (Controller): ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function UpdateUserBooking(req, res) {
  try {
    const {
      id,
      event,
      date,
      packageName,
      phone,
      client,
      guests,
      venue,
      totalAmount,
      advanceAmount,
      advancePaid,
      advanceDueDate,
      settlementPaymentMethod,
      settlementBankName,
      paymentMethod,
      paymentNote,
      status,
      timeSlot,
      bankName,
      rNo,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Booking ID is required!" });
    }

    if (!event || !packageName || !date || !phone || !client || !venue) {
      return res.status(400).json({
        message: "Missing required fields: event, date, packageName, phone, client, venue!",
      });
    }

    const result = await UpdateBooking(id, {
      event,
      date,
      packageName,
      phone,
      client,
      guests: guests || 0,
      venue,
      totalAmount: totalAmount || 0,
      advanceAmount: advanceAmount || 0,
      advancePaid: advancePaid || 0,
      advanceDueDate: advanceDueDate || null,
      paymentMethod: paymentMethod || "Cash",
      paymentNote: paymentNote || "",
      status: status || "Pending",
      timeSlot: timeSlot || "Night",
      bankName: bankName || null,
      rNo: rNo || null,
      settlementPaymentMethod: settlementPaymentMethod || "Cash",
      settlementBankName: settlementBankName || null,
    });

    console.log("Update Result:", result);

    if (!result?.success) {
      return res.status(400).json(result || { message: "Failed to update booking" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error In Booking Update (Controller): ", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async function DeleteUserBooking(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Booking ID is required!" });
    }

    const result = await DeleteBooking(id);

    if (!result?.success) {
      return res.status(400).json(result || { message: "Failed to delete booking" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log("Error In Booking Delete (Controller): ", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

module.exports = {
  CreateUserBooking,
  GetAllUserBookings,
  GetAllBookingsAdmin,
  UpdateUserBooking,
  DeleteUserBooking,
};