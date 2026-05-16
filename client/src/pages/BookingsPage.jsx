import { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import BookingModal from "../components/BookingModal";
import StatsSection from "../components/StatsSection";
import FiltersSection from "../components/FiltersSection";
import BookingsList from "../components/BookingsList";
import bookingService from "../services/booking.service";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const emptyForm = {
  client: "",
  phone: "",
  date: "",
  event: "Wedding",
  status: "Pending",
  guests: "",
  venue: "Hall A",
  totalAmount: "",
  advancePaid: "",
  paymentMethod: "Cash",
  paymentNote: "",
  package: "Standard"
};


export default function Bookings({ showToast }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: rawBookings = [], isLoading , error } = useQuery({
  queryKey: ["bookings"],
  queryFn:  bookingService.getAllBookings,
});

  const bookings = rawBookings?.map(b => {

    let formattedDate = "";
    if (b.date) {
      const dateObj = new Date(b.date);
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      const year = dateObj.getUTCFullYear();
      formattedDate = `${year}-${month}-${day}`;
    }
    return {
      ...b,
      totalAmount: b.total_amount || b.totalAmount,
      advancePaid: b.advance_paid || b.advancePaid,
      paymentNote: b.payment_note || b.paymentNote,
      date: formattedDate,
      package: b.package_name || b.package,
    };
  }) || [];

  const openNew = () => setModal({ mode: "new", booking: { ...emptyForm, id: Date.now() } });
  const openEdit = (b) => setModal({ mode: "edit", booking: { ...b } });
  const closeModal = () => setModal(null);

  const handleSave = async (form) => {
  if (!form.client || !form.date || !form.phone || !form.event || !form.package) {
    showToast?.("Please fill in all required fields");
    return;
  }
  try {
    setSaveLoading(true);
    if (modal.mode === "new") {
      await bookingService.createBooking(form);
      showToast?.("Booking created successfully!");
    } else {
      await bookingService.updateBooking(form);
      showToast?.("Booking updated successfully!");
    }
    closeModal();
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  } catch {
    showToast?.("Failed to save booking");
  } finally {
    setSaveLoading(false);
  }
};

  const filtered = bookings
    .filter(b => filter === "All" || b.status === filter)
    .filter(b =>
      b.client?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-green-50 p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-green-500 text-xs font-semibold tracking-widest uppercase mb-1">Management</p>
          <h1 className="text-4xl font-bold text-green-900 font-mono">Bookings</h1>
          <p className="text-green-500 text-sm mt-1">All banquet reservations in one place</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 border-none cursor-pointer"
        >
          <PlusCircle size={16} /> New Booking
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm text-red-600">{error?.message || "An error occurred"}</p>
        </div>
      )}

      {/* Stats Section */}
      <StatsSection bookings={bookings} />

      {/* Filters Section */}
      <FiltersSection
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        filteredCount={filtered.length}
      />

      {/* Bookings List */}
      <BookingsList
        filteredBookings={filtered}
        isLoading={isLoading}
        onEdit={openEdit}
      />

      {/* Modal */}
      {modal && (
        <BookingModal
          booking={modal.booking}
          isNew={modal.mode === "new"}
          onClose={closeModal}
          onSave={handleSave}
          isLoading={saveLoading}
        />
      )}
    </div>
  );
}