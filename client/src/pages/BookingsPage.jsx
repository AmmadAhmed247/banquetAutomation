import { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import BookingModal from "../components/BookingModal";
import StatsSection from "../components/StatsSection";
import FiltersSection from "../components/FiltersSection";
import BookingsList from "../components/BookingsList";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const emptyForm = {
  client: "",
  phone: "",
  date: "",
  event: "Wedding",
  status: "Pending",
  guests: "",
  venue: "Room A",
  totalAmount: "",
  advancePaid: "",
  paymentMethod: "Cash",
  paymentNote: "",
  package: "Standard"
};

const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function Bookings({ showToast }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: fetchedBookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/booking/allBookings`);
        return response.data.success ? response.data.bookings : [];
      } catch (err) {
        console.error("Error fetching bookings:", err);
        showToast?.("Failed to load bookings");
        return [];
      }
    }
  });

  const bookings = fetchedBookings?.map(b => ({
    ...b,
    totalAmount: b.total_amount || b.totalAmount,
    advancePaid: b.advance_paid || b.advancePaid,
    paymentNote: b.payment_note || b.paymentNote,
    date: formatDateForInput(b.date || b.date),
    package: b.package_name || b.package,
  })) || [];

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
        try {
          const response = await axios.post(`${API_BASE_URL}/booking/createBooking`, {
            event: form.event,
            date: form.date,
            packageName: form.package,
            phone: form.phone,
            client: form.client,
            guests: form.guests,
            venue: form.venue,
            totalAmount: form.totalAmount,
            advancePaid: form.advancePaid,
            paymentMethod: form.paymentMethod,
            paymentNote: form.paymentNote,
            status: form.status
          });

          if (response.data.success) {
            showToast?.("Booking created successfully!");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
          } else {
            throw new Error(response.data.message || "Failed to create booking");
          }
        } catch (err) {
          console.error("Error creating booking:", err);
          showToast?.("Failed to save booking");
        }
      } else {
        try {
          const response = await axios.put(`${API_BASE_URL}/booking/updateBooking`, {
            id: form.id,
            event: form.event,
            date: form.date,
            packageName: form.package,
            phone: form.phone,
            client: form.client,
            guests: form.guests,
            venue: form.venue,
            totalAmount: form.totalAmount,
            advancePaid: form.advancePaid,
            paymentMethod: form.paymentMethod,
            paymentNote: form.paymentNote,
            status: form.status
          });

          if (response.data.success) {
            showToast?.("Booking updated successfully!");
            closeModal();
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
          } else {
            throw new Error(response.data.message || "Failed to update booking");
          }
        } catch (err) {
          console.error("Error updating booking:", err);
          showToast?.("Failed to update booking");
        }
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
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