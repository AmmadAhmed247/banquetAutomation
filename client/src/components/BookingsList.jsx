import { Loader } from "lucide-react";
import BookingCard from "./BookingCard";

const statusConfig = {
  Confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "✓", bar: "bg-green-500" },
  Pending:   { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-200", icon: "⏱", bar: "bg-amber-400" },
  Cancelled: { bg: "bg-red-50",    text: "text-red-500",   border: "border-red-200",   icon: "✕", bar: "bg-red-400"   },
};

export default function BookingsList({ filteredBookings, isLoading, onEdit }) {
  if (isLoading && filteredBookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="col-span-3 text-center py-8 text-green-400">
        <p className="text-sm">No bookings found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5">
      {filteredBookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onEdit={onEdit}
          statusConfig={statusConfig}
        />
      ))}
    </div>
  );
}
