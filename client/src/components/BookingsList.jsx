import { Loader, Pencil, CalendarDays, Phone, Users, MapPin, Tag, CreditCard, Delete } from "lucide-react";

const statusConfig = {
  Confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "bg-green-500" },
  Pending:   { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-200", bar: "bg-amber-400" },
  Cancelled: { bg: "bg-red-50",    text: "text-red-500",   border: "border-red-200",   bar: "bg-red-400"   },
};

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

function PaymentBar({ total, advance }) {
  if (!total) return null;
  const pct = Math.min(100, Math.round(((advance || 0) / total) * 100));
  const remaining = total - (advance || 0);
  return (
    <div className="w-full">
      <div className="w-full bg-green-100 rounded-full h-1 mb-1">
        <div className="bg-green-500 h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-green-500 font-medium">{pct}% paid</span>
        <span className="text-[10px] text-red-400 font-medium">Due {formatPKR(remaining)}</span>
      </div>
    </div>
  );
}

// ── CARD (below xl) ──────────────────────────────────────────────────────────
function BookingCard({ booking, onEdit , onDelete }) {
  const sc = statusConfig[booking.status] || statusConfig.Pending;
  return (
    <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${sc.bar}`} />
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-green-900 text-sm">{booking.client}</p>
            <p className="text-[11px] text-green-400 mt-0.5">{booking.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
              {booking.status}
            </span>
            <button
              onClick={() => onEdit(booking)}
              className="p-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl transition-all"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(booking)}
              className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl transition-all"
            >
              <Delete size={13} />
            </button>
            
          </div>
        </div>

        <div className="border-t border-green-50" />

        {/* Grid fields */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Tag,          label: "Event",  value: booking.event },
            { icon: CalendarDays, label: "Date",   value: new Date(booking.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
            { icon: Users,        label: "Guests", value: booking.guests },
            { icon: MapPin,       label: "Venue",  value: booking.venue },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-green-50 rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon size={9} className="text-green-400" />
                <p className="text-[9px] text-green-400 font-semibold uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-xs font-bold text-green-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className="border-t border-green-50 pt-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <CreditCard size={10} className="text-green-400" />
              <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Payment</span>
            </div>
            <div className="flex flex-row gap-2">

            <span className="text-[10px] bg-green-50 border border-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
              <span className="text-black"  >Payment note: </span>{booking.payment_note}
            </span>
            <span className="text-[10px] bg-green-50 border border-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
              <span className="text-black"  >Method:</span> {booking.payment_method}
            </span>
            </div>
          </div>
          <p className="text-sm font-bold text-green-900 mb-1.5">{formatPKR(booking.totalAmount)}</p>
          <PaymentBar total={booking.totalAmount} advance={booking.advancePaid} />
        </div>

      </div>
    </div>
  );
}

// ── TABLE (xl and above) ─────────────────────────────────────────────────────
function BookingsTable({ filteredBookings, onEdit , onDelete }) {
  return (
    <div className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50/60 border-b border-green-100">
            {["Client", "Event", "Date", "Guests", "Venue", "Total", "Payment", "Payment Note", "Status",  "", ""].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold text-green-500 uppercase tracking-wider px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-green-50">
          {filteredBookings.map((booking) => {
            const sc = statusConfig[booking.status] || statusConfig.Pending;
            return (
              <tr key={booking.id} className="hover:bg-green-50/40 transition-colors">

                <td className="px-4 py-3.5">
                  <p className="font-semibold text-green-900">{booking.client}</p>
                  <p className="text-[11px] text-green-400 mt-0.5">{booking.phone}</p>
                </td>

                <td className="px-4 py-3.5">
                  <p className="font-medium text-green-800">{booking.event}</p>
                  {booking.package && <p className="text-[11px] text-green-400 mt-0.5">{booking.package}</p>}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-green-800">
                  {new Date(booking.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>

                <td className="px-4 py-3.5 text-green-800">{booking.guests}</td>

                <td className="px-4 py-3.5 text-green-800">{booking.venue}</td>

                <td className="px-4 py-3.5 font-semibold text-green-900 whitespace-nowrap">
                  {formatPKR(booking.totalAmount)}
                </td>

                <td className="px-4 py-3.5 min-w-[150px]">
                  <span className="text-[10px] bg-green-50 border border-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold mb-1.5 inline-block">
                    {booking.payment_method}
                  </span>
                  <PaymentBar total={booking.totalAmount} advance={booking.advancePaid} />
                </td>

                <td className="px-4 py-3.5">
                  <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-green-50 border-green-100 text-green-600`}>
                    {booking.payment_note}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                    {booking.status}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <button
                    onClick={() => onEdit(booking)}
                    className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                </td>
                  <td className="px-4 py-3.5">
                  <button
                    onClick={() => onDelete(booking)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Delete size={11} /> Delete
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// MAIN EXPORT 
export default function BookingsList({ filteredBookings, isLoading, onEdit , onDelete }) {
  if (isLoading && filteredBookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-12 text-green-400">
        <p className="text-sm">No bookings found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <>
      {/* Card grid — below xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:hidden">
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onEdit={onEdit}  onDelete={onDelete} />
        ))}
      </div>

      {/* Table — xl and above */}
      <div className="hidden xl:block">
        <BookingsTable filteredBookings={filteredBookings} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  );
}