import {
  CalendarDays, Phone, Users, MapPin, Tag,
  CreditCard, Pencil
} from "lucide-react";

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

function PaymentBar({ total, advance }) {
  if (!total) return null;
  const pct = Math.min(100, Math.round(((advance || 0) / total) * 100));
  const remaining = total - (advance || 0);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-green-500 font-semibold mb-1">
        <span>Advance: {formatPKR(advance)}</span>
        <span>{pct}% paid</span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-1.5">
        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-red-400 font-medium mt-1">Remaining: {formatPKR(remaining)}</p>
    </div>
  );
}



export default function BookingCard({ booking, onEdit, statusConfig }) {
  const sc = statusConfig[booking.status] || statusConfig.Pending;
  console.log(booking);
  

  return (
    <div className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-green-100 hover:-translate-y-1 transition-all duration-300 group">
      <div className={`h-1.5 w-full ${sc.bar}`} />
      <div className="p-5">
        {/* Client + Status + Edit btn */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-green-900">{booking.client}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone size={11} className="text-green-400" />
              <p className="text-xs text-green-400">{booking.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
              {booking.status}
            </span>
            <button
              onClick={() => onEdit(booking)}
              className=" bg-green-50  border border-green-200 rounded-lg p-1.5 cursor-pointer"
              title="Edit booking"
            >
              <Pencil size={14} className="text-green-600" />
            </button>
          </div>
        </div>

        <div className="border-t border-green-50 mb-3" />

        {/* Detail Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-0.5">
              <Tag size={10} className="text-green-400" />
              <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Event</p>
            </div>
            <p className="text-sm font-bold text-green-800">{booking.event}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-0.5">
              <CalendarDays size={10} className="text-green-400" />
              <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Date</p>
            </div>
            <p className="text-sm font-bold text-green-800">
              {new Date(booking.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-1 mb-0.5">
              <Users size={10} className="text-green-400" />
              <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Guests</p>
            </div>
            <p className="text-sm font-bold text-green-800">{booking.guests}</p>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 mb-3">
          <MapPin size={12} className="text-green-500" />
          <p className="text-xs font-semibold text-green-700">{booking.venue}</p>
        </div>

        {/* Payment */}
        <div className="border-t border-green-50 pt-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard size={11} className="text-green-500" />
            <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Payment</p>
            <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">{booking.payment_method}</span>
          </div>
          <p className="text-sm font-bold text-green-900">{formatPKR(booking.totalAmount)}</p>
          {booking.paymentNote && <p className="text-[10px] text-green-400 italic mt-0.5">{booking.payment_note}</p>}
          <PaymentBar total={booking.totalAmount} advance={booking.advancePaid} />
        </div>

        {/* Edit CTA at bottom */}
        <button
          onClick={() => onEdit(booking)}
          className="mt-4 w-full flex items-center justify-center gap-2 border border-green-200 text-green-600 text-xs font-semibold py-2 rounded-xl "
        >
          <Pencil size={12} /> Edit Booking
        </button>
      </div>
    </div>
  );
}
