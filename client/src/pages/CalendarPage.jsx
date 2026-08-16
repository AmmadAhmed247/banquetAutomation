import { useState } from "react";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabbi Ul Awwal", "Rabbi Ul Akhir",
  "Jumada Al Ula", "Jumada Al Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu Al Qi'dah", "Dhu Al Hijjah"
];

// Helper to format today's Hijri date as: 1 Rabbi Ul Awwal 1448 AH
const getTodayIslamicDate = () => {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura-nu-latn", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const monthName = HIJRI_MONTHS[parseInt(parts.month, 10) - 1];
  return `${parts.day} ${monthName} ${parts.year} AH`;
};
function BookingChip({ booking ,addons=[] }) {
  const isA = booking.hall === "a";
  const isPending = booking.status?.toLowerCase() === "pending";


  const themeClasses = isPending
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : isA
    ? "bg-blue-50 border-blue-200 text-blue-800"
    : "bg-red-50 border-red-200 text-red-800";

  const accentColorClass = isPending
    ? "text-amber-700"
    : isA
    ? "text-blue-700"
    : "text-red-700";

  const borderColor = isPending ? "#f59e0b" : isA ? "#2563eb" : "#dc2626";

  return (
    <div className={`p-3 rounded-xl mb-2 border ${themeClasses}`}>
      <div className="flex justify-between items-center mb-1">
        <p className={`text-[10px] font-semibold ${accentColorClass}`}>
          Hall {booking.hall.toUpperCase()}
        </p>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          isPending ? "bg-amber-200 text-amber-900" : isA ? "bg-blue-200 text-blue-900" : "bg-red-200 text-red-900"
        }`}>
          {booking.status}
        </span>
      </div>

      <p className="text-xs font-semibold text-gray-900 mb-0.5">{booking.client}</p>
     
      
      {/* Additional details */}
      <div className="space-y-1.5 text-[10px] mb-2 pb-2 border-b border-opacity-20" style={{ borderColor }}>
        {booking.phone && (
          <div className="flex justify-between">
            <span className="text-slate-600">Phone:</span>
            <span className="font-medium text-gray-800">{booking.phone}</span>
          </div>
        )}
        {booking.guests && (
          <div className="flex justify-between">
            <span className="text-slate-600">Guests:</span>
            <span className="font-medium text-gray-800">{booking.guests}</span>
          </div>
        )}
        {booking.totalAmount && (
          <div className="flex justify-between">
            <span className="text-slate-600">Total:</span>
            <span className="font-medium text-gray-800">PKR {Number(booking.totalAmount).toLocaleString()}</span>
          </div>
        )}
        {booking.advancePaid && (
          <div className="flex justify-between">
            <span className="text-slate-600">Advance:</span>
            <span className="font-medium text-gray-800">PKR {Number(booking.advancePaid).toLocaleString()}</span>
          </div>
        )}
        {booking.advanceDueDate && (
          <div className="flex justify-between">
            <span className="text-slate-600">Due Date:</span>
            <span className="font-medium text-gray-800">{new Date(booking.advanceDueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
          </div>
        )}
        {booking.timeSlot && (
          <div className="flex justify-between">
            <span className="text-slate-600">Time Slot:</span>
            <span className="font-medium text-gray-800">{booking.timeSlot}</span>
          </div>
        )}
        {booking.bankName && (
          <div className="flex justify-between">
            <span className="text-slate-600">Bank:</span>
            <span className="font-medium text-gray-800">{booking.bankName}</span>
          </div>
        )}
        {booking.paymentMethod && (
          <div className="flex justify-between">
            <span className="text-slate-600">Method:</span>
            <span className="font-medium text-gray-800">{booking.paymentMethod}</span>
          </div>
        )}
      </div>
      {addons.length > 0 && (
        <div className="mt-2 pt-2 border-t border-opacity-20" style={{ borderColor }}>
          <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${accentColorClass}`}>
            Add-ons
          </p>
          <div className="space-y-1">
            {addons.map((a) => (
              <div key={a.id} className="flex justify-between text-[10px]">
                <span className="text-slate-600 truncate pr-2">{a.service}</span>
                <span className="font-medium text-gray-800 shrink-0">
                  PKR {Number(a.client_price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
}

export default function CalendarView() {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView]           = useState("both");
  const [showPanel, setShowPanel] = useState(false); // mobile side panel toggle

  const { data: fetchedBookings = [], isLoading, error } = getAllBookings();
  const { data: fetchedAddons = [] } = getAllAddons();
  const addonsByBooking = fetchedAddons.reduce((acc, a) => {
  const key = a.bookingId ?? a.booking_id; // depends on what your service returns (camel vs snake)
  if (!acc[key]) acc[key] = [];
  acc[key].push(a);
  return acc;
}, {});
  const BOOKINGS = fetchedBookings
    .filter((b) => b.status?.toLowerCase() !== "cancelled") // Filter out cancelled bookings
    .map((b) => {
      const dateObj  = new Date(b.date);
      const month    = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day      = String(dateObj.getUTCDate()).padStart(2, "0");
      const year     = dateObj.getUTCFullYear();
      const hallChar =
        b.venue?.toLowerCase().includes("hall a") ? "a" :
        b.venue?.toLowerCase().includes("hall b") ? "b" : "a";
      return {
        id:             b.id,
        hall:           hallChar,
        date:           `${year}-${month}-${day}`,
        client:         b.client,
        event:          b.event,
        package:        b.package_name || b.package,
        status:         b.status,
        phone:          b.phone,
        guests:         b.guests,
        totalAmount:    b.total_amount || b.totalAmount,
        advancePaid:    b.advance_paid || b.advancePaid,
        advanceDueDate: b.advance_due_date || b.advanceDueDate,
        paymentMethod:  b.payment_method || b.paymentMethod,
        paymentNote:    b.payment_note || b.paymentNote,
        timeSlot:       b.time_slot || b.timeSlot,
        bankName:       b.bank_name || b.bankName,
      };
    });

  const yr = current.getFullYear();
  const mo = current.getMonth();

  const bMap = {};
  BOOKINGS.forEach((b) => {
    const d = new Date(b.date);
    if (d.getFullYear() !== yr || d.getMonth() !== mo) return;
    if (view !== "both" && b.hall !== view) return;
    const day = d.getDate();
    if (!bMap[day]) bMap[day] = [];
    bMap[day].push(b);
  });

  const firstDayOfMonth = new Date(yr, mo, 1).getDay();
  const daysInMonth     = new Date(yr, mo + 1, 0).getDate();
  const today           = new Date();
  const isCurrentMonth  = today.getFullYear() === yr && today.getMonth() === mo;

  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedBookings = selectedDay ? (bMap[selectedDay] || []) : [];

  const tabBase = "px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all";
  function tabClass(key) {
    if (key === "both")
      return view === "both"
        ? `${tabBase} bg-gray-100 text-gray-900 border-gray-400`
        : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-gray-50`;
    if (key === "a")
      return view === "a"
        ? `${tabBase} bg-red-50 text-red-700 border-red-300`
        : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200`;
    return view === "b"
      ? `${tabBase} bg-blue-50 text-blue-700 border-blue-300`
      : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading calendar…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm font-medium">Failed to load bookings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-8">

      {/* ── Top navigation ── */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">

        {/* Title + Islamic Date */}
        <div>
          <h1 className="font-mono text-2xl xl:text-[28px] font-bold text-gray-900">Hall Bookings</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-400 text-xs">Visual overview of booked dates by hall</p>
            <span className="text-slate-300">•</span>
            <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded-md">
               {getTodayIslamicDate()}
            </p>
          </div>
        </div>

        {/* Hall tabs + month nav row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hall tabs */}
          <div className="flex gap-1.5">
            {[
              { key: "both", label: "Both" },
              { key: "a",    label: "Hall A" },
              { key: "b",    label: "Hall B" },
            ].map(({ key, label }) => (
              <button key={key} className={tabClass(key)} onClick={() => { setView(key); setSelectedDay(null); setShowPanel(false); }}>
                {label}
              </button>
            ))}
          </div>
          

          {/* Month navigator */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            
            <button
              className="w-8 h-8 rounded-xl border border-green-100 bg-white flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer"
              onClick={() => { setCurrent(new Date(yr, mo - 1, 1)); setSelectedDay(null); setShowPanel(false); }}
            >‹</button>
            <span className="font-semibold text-sm w-36 text-center text-gray-800">
              {MONTH_NAMES[mo]} {yr}
            </span>
            
            <button
              className="w-8 h-8 rounded-xl border border-green-100 bg-white flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer"
              onClick={() => { setCurrent(new Date(yr, mo + 1, 1)); setSelectedDay(null); setShowPanel(false); }}
            >›</button>
          </div>
        </div>
        
      </div>
      

      {/* ── Legend ── */}
      <div className="flex gap-4 mb-4">
        {(view === "both" || view === "a") && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-blue-300 inline-block" />Hall A
          </div>
        )}
        {(view === "both" || view === "b") && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-red-300 inline-block" />Hall B
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-amber-300 inline-block" />Pending
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="xl:grid xl:grid-cols-[1fr_300px] xl:gap-5">

        {/* Calendar card */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden mb-4 xl:mb-0">

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-green-50">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="min-h-[60px] xl:min-h-[84px] border-b border-r border-green-50" />;

              const bookings = bMap[day] || [];
              const isToday  = isCurrentMonth && today.getDate() === day;
              const isSel    = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => {
                    setSelectedDay(day === selectedDay ? null : day);
                    setShowPanel(true);
                  }}
                  className={`min-h-[60px] xl:min-h-[84px] p-1.5 xl:p-2 border-b border-r border-green-50 cursor-pointer transition-colors
                    ${isSel ? "bg-green-50" : "hover:bg-slate-50"}`}
                >
                  {/* Day number */}
                  {isToday ? (
                    <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold mb-1">
                      {day}
                    </div>
                  ) : (
                    <div className={`text-[11px] xl:text-[13px] font-medium mb-1 leading-none ${isSel ? "text-green-600 font-bold" : "text-slate-500"}`}>
                      {day}
                    </div>
                  )}

                  {/* Pills — hidden on very small, shown on sm+ */}
                  <div className="hidden sm:block">
                    {bookings.slice(0, 2).map((b) => {
                      const isPending = b.status?.toLowerCase() === "pending";
                      return (
                        <div
                          key={b.id}
                          className={`text-[9px] xl:text-[10px] px-1 py-0.5 mb-0.5 rounded font-semibold truncate ${
                            isPending 
                              ? "bg-amber-200 text-amber-900" 
                              : b.hall === "a" 
                              ? "bg-blue-200 text-blue-900" 
                              : "bg-red-200 text-red-900"
                          }`}
                        >
                          {b.client.split("&")[0].trim()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dot indicators on mobile */}
                  <div className="flex gap-0.5 sm:hidden flex-wrap">
                    {bookings.slice(0, 3).map((b) => {
                      const isPending = b.status?.toLowerCase() === "pending";
                      return (
                        <span 
                          key={b.id} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPending 
                              ? "bg-amber-400" 
                              : b.hall === "a" 
                              ? "bg-blue-400" 
                              : "bg-red-400"
                          }`} 
                        />
                      );
                    })}
                  </div>

                  {bookings.length > 2 && (
                    <div className="text-[9px] text-slate-400 hidden sm:block">+{bookings.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className={`bg-white rounded-2xl border border-green-100 p-4 xl:block ${showPanel || selectedDay ? "block" : "hidden xl:block"}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-gray-800">
              {selectedDay ? `${MONTH_NAMES[mo]} ${selectedDay}, ${yr}` : "Select a date"}
            </p>
            {/* Close button on mobile */}
            {showPanel && (
              <button
                className="xl:hidden text-slate-400 hover:text-slate-600 text-lg leading-none"
                onClick={() => { setShowPanel(false); setSelectedDay(null); }}
              >✕</button>
            )}
          </div>

          {!selectedDay && (
            <p className="text-xs text-slate-400 text-center pt-8">Click any date to see its bookings</p>
          )}

          {selectedDay && selectedBookings.length === 0 && (
            <p className="text-xs text-slate-400 text-center pt-8">No bookings for this date</p>
          )}

          <div className="overflow-y-auto max-h-[400px] xl:max-h-[520px]">
            {selectedBookings.map((b) => (
  <BookingChip key={b.id} booking={b} addons={addonsByBooking[b.id] || []} />
))}
          </div>
        </div>

      </div>
    </div>
  );
}