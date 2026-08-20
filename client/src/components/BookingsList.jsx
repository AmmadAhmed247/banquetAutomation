import React from "react";
import { Loader, Pencil, CalendarDays, Users, MapPin, Tag, CreditCard, Delete, Clock, Landmark } from "lucide-react";

const statusConfig = {
  Confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", bar: "bg-green-500" },
  Pending:   { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-200", bar: "bg-amber-400" },
  Cancelled: { bg: "bg-red-50",    text: "text-red-500",   border: "border-red-200",   bar: "bg-red-400"   },
  Finished:  { bg: "bg-blue-50",   text: "text-blue-500",  border: "border-blue-200",  bar: "bg-blue-500"  },
};

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

function getTimeSlot(booking) {
  return booking.timeSlot ?? booking.time_slot ?? "—";
}
function getBankName(booking) {
  return booking.bankName ?? booking.bank_name ?? "";
}
function getRNo(booking) {
  return booking.rNo ?? booking.r_no ?? "";
}

function getTotalAmount(booking) {
  return Number(booking.totalAmount ?? booking.total_amount ?? 0);
}

function getAdvanceAmount(booking) {
  return Number(booking.advanceAmount ?? booking.advance_amount ?? 0);
}

function getAdvancePaid(booking) {
  return Number(booking.advancePaid ?? booking.advance_paid ?? 0);
}

// ── REVENUE & DUE CALCULATION LOGIC ──────────────────────────────────────────
function getRevenueAmount(booking) {
  const status = (booking.status || "").toLowerCase();
  
  if (status === "cancelled") return 0;
  
  // Finished -> Take total booking amount
  if (status === "finished") {
    return getTotalAmount(booking);
  }
  
  // Confirmed & Pending -> Take advance amount paid
  return getAdvancePaid(booking);
}

function getRemainingAmount(booking) {
  const status = (booking.status || "").toLowerCase();
  if (status === "finished" || status === "cancelled") return 0;
  
  const total = getTotalAmount(booking);
  const revenue = getRevenueAmount(booking);
  return Math.max(0, total - revenue);
}

function PaymentBar({ booking }) {
  const total = getTotalAmount(booking);
  if (!total) return null;

  const status = (booking.status || "").toLowerCase();
  const isFinished = status === "finished";
  const revenue = getRevenueAmount(booking);
  const remaining = getRemainingAmount(booking);
  
  const pct = isFinished ? 100 : Math.min(100, Math.round((revenue / total) * 100));

  return (
    <div className="w-full">
      <div className="w-full bg-zinc-100 rounded-full h-1 mb-1 overflow-hidden">
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${isFinished ? "bg-blue-500" : "bg-green-500"}`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
      <div className="flex justify-between gap-2">
        <span className={`text-[10px] font-medium truncate ${isFinished ? "text-blue-600" : "text-green-600"}`}>
          {pct}% collected
        </span>
        <span className={`text-[10px] font-medium shrink-0 ${remaining > 0 ? "text-red-400" : "text-emerald-600"}`}>
          {remaining > 0 ? `Due ${formatPKR(remaining)}` : "Settled"}
        </span>
      </div>
    </div>
  );
}

// ── CARD (below xl) ──────────────────────────────────────────────────────────
function BookingCard({ booking, onEdit, onDelete }) {
  const sc = statusConfig[booking.status] || statusConfig.Pending;
  const bankName = getBankName(booking);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${sc.bar}`} />
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-zinc-900 text-sm truncate">{booking.client}</p>
              {getRNo(booking) && (
                <span className="text-[9px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded shrink-0">
                  #{getRNo(booking)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{booking.phone}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${sc.bg} ${sc.text} ${sc.border}`}>
              {booking.status}
            </span>
            <button
              onClick={() => onEdit(booking)}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(booking)}
              className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <Delete size={13} />
            </button>
          </div>
        </div>

        <div className="border-t border-zinc-100" />

        {/* Grid fields */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Tag,          label: "Event",        value: booking.event },
            { icon: CalendarDays, label: "Date",         value: booking.date ? new Date(booking.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            { icon: Clock,        label: "Time Slot",    value: getTimeSlot(booking) },
            { icon: CalendarDays, label: "Advance Due",  value: booking.advanceDueDate ? new Date(booking.advanceDueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            { icon: Users,        label: "Guests",       value: booking.guests },
            { icon: MapPin,       label: "Venue",        value: booking.venue },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-zinc-100 rounded-xl p-2.5 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon size={9} className="text-zinc-400 shrink-0" />
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider truncate">{label}</p>
              </div>
              <p className="text-xs font-bold text-zinc-800 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className="border-t border-zinc-100 pt-2">
          <div className="flex items-center gap-1 mb-1.5">
            <CreditCard size={10} className="text-zinc-400 shrink-0" />
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Payment</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {booking.payment_note && (
              <span className="max-w-full text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-semibold truncate">
                <span className="text-black">Note: </span>{booking.payment_note}
              </span>
            )}
            <span className="max-w-full text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-semibold truncate">
              <span className="text-black">Method:</span> {booking.payment_method || "—"}
            </span>
            {booking.payment_method === "Bank Transfer" && bankName && (
              <span className="max-w-full text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold truncate flex items-center gap-1">
                <Landmark size={9} /> {bankName}
              </span>
            )}
          </div>

          <p className="text-sm font-bold text-zinc-900 mb-2">{formatPKR(getTotalAmount(booking))}</p>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-semibold truncate">
              <span className="text-black">Advance Target:</span> {formatPKR(getAdvanceAmount(booking))}
            </span>
            <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-semibold truncate">
              <span className="text-black">Advance Paid:</span> {formatPKR(getAdvancePaid(booking))}
            </span>
            <span className="text-[10px] bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-semibold truncate">
              <span className="text-black">Revenue Picked:</span> {formatPKR(getRevenueAmount(booking))}
            </span>
          </div>

          <PaymentBar booking={booking} />
        </div>

      </div>
    </div>
  );
}

// ── TABLE (xl and above) ─────────────────────────────────────────────────────
function BookingsTable({ filteredBookings, onEdit, onDelete }) {
  const headers = [
    "R. No.", 
    "Date", 
    "Event", 
    "Client", 
    "Event Date", 
    "Time Slot", 
    "Guests", 
    "Venue", 
    "Total Amount", 
    "Total Advance", 
    "Advance Paid", 
    "Revenue Picked", 
    "Advance Due", 
    "Payment Note", 
    "Status", 
    "", 
    ""
  ];

  return (
    <div className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50/60 border-b border-green-100">
              {headers.map((h, i) => (
                <th key={i} className="text-left text-[10px] font-semibold text-green-600 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-green-50">
            {filteredBookings.map((booking) => {
              const sc = statusConfig[booking.status] || statusConfig.Pending;
              const bankName = getBankName(booking);

              return (
                <tr key={booking.id} className="hover:bg-green-50/40 transition-colors">
                  
                  {/* R. No. */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-green-700">
                      {getRNo(booking) ? `#${getRNo(booking)}` : "—"}
                    </span>
                  </td>

                  {/* Date Created */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-green-900">
                      {(booking.createdAt || booking.created_at) ? new Date(booking.createdAt || booking.created_at).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </td>

                  {/* Event */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-green-900">{booking.event}</p>
                  </td>

                  {/* Client */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-green-900">{booking.client}</p>
                    <p className="text-[11px] text-green-500 mt-0.5">{booking.phone}</p>
                  </td>

                  {/* Event Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-green-900">
                    {booking.date ? new Date(booking.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>

                  {/* Time Slot */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-blue-50 border-blue-100 text-blue-600">
                      {getTimeSlot(booking)}
                    </span>
                  </td>

                  {/* Guests */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-green-800">{booking.guests}</td>

                  {/* Venue */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-green-800">{booking.venue}</td>

                  {/* Total Amount */}
                  <td className="px-4 py-3.5 font-semibold text-green-900 whitespace-nowrap">
                    {formatPKR(getTotalAmount(booking))}
                  </td>

                  {/* Total Advance */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-green-800">
                    {formatPKR(getAdvanceAmount(booking))}
                  </td>

                  {/* Advance Paid */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-green-800">
                    {formatPKR(getAdvancePaid(booking))}
                  </td>

                  {/* Revenue Picked & Payment breakdown */}
                  <td className="px-4 py-3.5 min-w-[170px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] bg-green-50 border border-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold inline-block">
                          {booking.payment_method || "—"}
                        </span>
                        {booking.payment_method === "Bank Transfer" && bankName && (
                          <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                            <Landmark size={9} /> {bankName}
                          </span>
                        )}
                        <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-semibold truncate">
                          <span className="font-semibold text-green-800">Revenue:</span>&nbsp;{formatPKR(getRevenueAmount(booking))}
                        </span>
                      </div>
                      <PaymentBar booking={booking} />
                    </div>
                  </td>

                  {/* Advance Due Date */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-green-800">
                    {booking.advanceDueDate ? new Date(booking.advanceDueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>

                  {/* Payment Note */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-green-50 border-green-100 text-green-600">
                      {booking.payment_note || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {booking.status}
                    </span>
                  </td>

                  {/* Edit Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(booking)}
                      className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                  </td>

                  {/* Delete Action */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      onClick={() => onDelete(booking)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
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
    </div>
  );
}

// MAIN EXPORT
// MAIN EXPORT
export default function BookingsList({ filteredBookings, isLoading, onEdit, onDelete }) {
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

  // Sort bookings so creations from today float to the top
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format in local timezone
    
    const dateA = (a.createdAt || a.created_at) ? new Date(a.createdAt || a.created_at).toLocaleDateString("en-CA") : "";
    const dateB = (b.createdAt || b.created_at) ? new Date(b.createdAt || b.created_at).toLocaleDateString("en-CA") : "";

    const isTodayA = dateA === todayStr;
    const isTodayB = dateB === todayStr;

    if (isTodayA && !isTodayB) return -1; // A comes first
    if (!isTodayA && isTodayB) return 1;  // B comes first

    // Secondary sort: newest date/time first for the rest
    return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
  });

  return (
    <>
      {/* Card grid — below xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:hidden">
        {sortedBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      {/* Table — xl and above */}
      <div className="hidden xl:block">
        <BookingsTable filteredBookings={sortedBookings} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  );
}