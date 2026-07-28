import { useState } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BookingModal from "../components/BookingModal";
import StatsSection from "../components/StatsSection";
import FiltersSection from "../components/FiltersSection";
import BookingsList from "../components/BookingsList";
import bookingService from "../services/booking.service";

function formatDateInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



const emptyForm = {
  client: "",
  phone: "",
  date: "",
  event: "Wedding",
  status: "Pending",
  guests: "",
  venue: "Hall A",
  totalAmount: "",
  advanceAmount: "",
  advancePaid: "",
  advanceDueDate: "",   
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
    const formattedDate = formatDateInput(b.date);
    const formattedDueDate = formatDateInput(b.advance_due_date || b.advanceDueDate);

    return {
      ...b,
      totalAmount: b.total_amount || b.totalAmount,
      advanceAmount: b.advance_amount || b.advanceAmount,
      advancePaid: b.advance_paid || b.advancePaid,
      advanceDueDate: formattedDueDate || b.advanceDueDate || "",
      paymentNote: b.payment_note || b.paymentNote,
      date: formattedDate || b.date || "",
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
const handleDelete = (booking) => {
  toast((t) => (
    <div className="flex items-center gap-3">
      <p className="text-sm text-gray-700">
        Delete booking for <span className="font-semibold text-gray-900">{booking.client}</span>?
      </p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await bookingService.deleteBooking(booking.id);
              toast.success("Booking deleted successfully!");
              queryClient.invalidateQueries({ queryKey: ["bookings"] });
            } catch {
              toast.error("Failed to delete booking");
            }
          }}
          className="text-xs font-semibold bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg"
        >
          Delete
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  ), { duration: Infinity });
};

  const filtered = bookings
    .filter(b => filter === "All" || b.status === filter)
    .filter(b =>
      b.client?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#F8F7F3] p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-green-600 text-[11px] font-semibold tracking-widest uppercase mb-1.5">Management</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">All banquet reservations in one place</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm transition-colors duration-200 border-none cursor-pointer w-full sm:w-auto"
        >
          <PlusCircle size={16} /> New Booking
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-white border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-600">{error?.message || "An error occurred"}</p>
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
        onDelete={handleDelete}
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