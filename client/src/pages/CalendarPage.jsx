import { useState } from "react";
import { getAllBookings } from "../lib/hooks/booking.hook";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Booking chip in side panel ───────────────────────────────────────────────
function BookingChip({ booking }) {
  const isA = booking.hall === "a";
  return (
    <div
      className={`p-3.5 rounded-xl mb-2.5 border ${
        isA ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
      }`}
    >
      <p className={`text-[10px] font-semibold mb-1 ${isA ? "text-red-700" : "text-blue-700"}`}>
        Hall {booking.hall.toUpperCase()}
      </p>
      <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{booking.client}</p>
      <p className="text-[12px] text-slate-500">
        {booking.event} &bull; {booking.package}
      </p>
      <p className={`text-[11px] mt-1 font-semibold ${isA ? "text-red-700" : "text-blue-700"}`}>
        {booking.status}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CalendarView() {
  const [current, setCurrent] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState("both"); // "both" | "a" | "b"

  const { data: fetchedBookings = [], isLoading, error } = getAllBookings();

  const BOOKINGS = fetchedBookings.map((b) => {
    const dateObj = new Date(b.date);
    const month   = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day     = String(dateObj.getUTCDate()).padStart(2, "0");
    const year    = dateObj.getUTCFullYear();

    const hallChar =
      b.venue?.toLowerCase().includes("hall a") ? "a" :
      b.venue?.toLowerCase().includes("hall b") ? "b" : "a";

    return {
      id:      b.id,
      hall:    hallChar,
      date:    `${year}-${month}-${day}`,
      client:  b.client,
      event:   b.event,
      package: b.package_name || b.package,
      status:  b.status,
    };
  });

  const yr = current.getFullYear();
  const mo = current.getMonth();

  // day → filtered bookings[]
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

  // ── Tab class helper ───────────────────────────────────────────────────────
  const tabBase = "px-4 py-1.5 rounded-xl border text-[13px] font-medium cursor-pointer transition-all";
  function tabClass(key) {
    if (key === "both")
      return view === "both"
        ? `${tabBase} bg-gray-100 text-gray-900 border-gray-400`
        : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-gray-50`;
    if (key === "a")
      return view === "a"
        ? `${tabBase} bg-red-50 text-red-700 border-red-300`
        : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200`;
    // key === "b"
    return view === "b"
      ? `${tabBase} bg-blue-50 text-blue-700 border-blue-300`
      : `${tabBase} bg-white text-gray-500 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200`;
  }

  // ── Loading ────────────────────────────────────────────────────────────────
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

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm font-medium">
          Failed to load bookings. Please try again.
        </p>
      </div>
    );
  }

  // ── Calendar ───────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* ── Top navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

        {/* Title */}
        <div>
          <h1 className="font-mono text-[28px] font-bold text-gray-900">
            Hall Bookings
          </h1>
          <p className="text-slate-400 text-[13px] mt-0.5">
            Visual overview of booked dates by hall
          </p>
        </div>

        {/* Hall tabs */}
        <div className="flex gap-1.5">
          {[
            { key: "both", label: "Both halls" },
            { key: "a",    label: "Hall A" },
            { key: "b",    label: "Hall B" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={tabClass(key)}
              onClick={() => { setView(key); setSelectedDay(null); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button
            className="w-[34px] h-[34px] rounded-xl border border-green-100 bg-white flex items-center justify-center text-base hover:bg-green-50 transition-colors cursor-pointer"
            onClick={() => { setCurrent(new Date(yr, mo - 1, 1)); setSelectedDay(null); }}
          >
            ‹
          </button>
          <span className="font-semibold text-[14px] w-40 text-center text-gray-800">
            {MONTH_NAMES[mo]} {yr}
          </span>
          <button
            className="w-[34px] h-[34px] rounded-xl border border-green-100 bg-white flex items-center justify-center text-base hover:bg-green-50 transition-colors cursor-pointer"
            onClick={() => { setCurrent(new Date(yr, mo + 1, 1)); setSelectedDay(null); }}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 mb-4">
        {(view === "both" || view === "a") && (
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-red-300 inline-block" />
            Hall A — booked
          </div>
        )}
        {(view === "both" || view === "b") && (
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-blue-300 inline-block" />
            Hall B — booked
          </div>
        )}
      </div>

      {/* ── Main layout ── */}
      <div className="grid grid-cols-[1fr_300px] gap-5">

        {/* Calendar card */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 bg-green-50">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              // Empty leading cell
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[84px] border-b border-r border-green-50"
                  />
                );
              }

              const bookings = bMap[day] || [];
              const isToday  = isCurrentMonth && today.getDate() === day;
              const isSel    = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-[84px] p-2 border-b border-r border-green-50 cursor-pointer transition-colors
                    ${isSel ? "bg-green-50" : "hover:bg-slate-50"}`}
                >
                  {/* Day number */}
                  {isToday ? (
                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[11px] font-bold mb-1">
                      {day}
                    </div>
                  ) : (
                    <div
                      className={`text-[13px] font-medium mb-1 leading-none ${
                        isSel ? "text-green-600 font-bold" : "text-slate-500"
                      }`}
                    >
                      {day}
                    </div>
                  )}

                  {/* Booking pills */}
                  {bookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className={`text-[10px] px-1.5 py-0.5 mb-0.5 rounded font-semibold truncate ${
                        b.hall === "a"
                          ? "bg-red-200 text-red-900"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {b.client.split("&")[0].trim()}
                    </div>
                  ))}

                  {bookings.length > 2 && (
                    <div className="text-[10px] text-slate-400">
                      +{bookings.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="bg-white rounded-2xl border border-green-100 p-5">
          <p className="font-semibold text-[15px] text-gray-800 mb-4">
            {selectedDay
              ? `${MONTH_NAMES[mo]} ${selectedDay}, ${yr}`
              : "Select a date"}
          </p>

          {!selectedDay && (
            <p className="text-[13px] text-slate-400 text-center pt-8">
              Click any date to see its bookings
            </p>
          )}

          {selectedDay && selectedBookings.length === 0 && (
            <p className="text-[13px] text-slate-400 text-center pt-8">
              No bookings for this date
            </p>
          )}

          <div className="overflow-y-auto max-h-[520px]">
            {selectedBookings.map((b) => (
              <BookingChip key={b.id} booking={b} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}