import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function HallTab({ label, active, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 18px",
        borderRadius: 10,
        border: "1px solid",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .12s",
        ...style,
        ...(active ? style.active : style.inactive),
      }}
    >
      {label}
    </button>
  );
}

/** Side-panel booking chip */
function BookingChip({ booking }) {
  const isA = booking.hall === "a";
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        border: "1px solid",
        background: isA ? "#FCEBEB" : "#E6F1FB",
        borderColor: isA ? "#F7C1C1" : "#B5D4F4",
      }}
    >
      <p style={{ fontSize: 10, fontWeight: 600, color: isA ? "#993C1D" : "#185FA5", marginBottom: 3 }}>
        Hall {booking.hall.toUpperCase()}
      </p>
      <p style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>{booking.client}</p>
      <p style={{ fontSize: 12, color: "#64748b" }}>
        {booking.event} &bull; {booking.package}
      </p>
      <p style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: isA ? "#A32D2D" : "#185FA5" }}>
        {booking.status}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CalendarView() {
  const [current, setCurrent] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState("both"); // "both" | "a" | "b"

  // Fetch bookings from backend
  
  const { data: fetchedBookings = [], isLoading, error } = useQuery({
    queryKey: ["calendarBookings"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/booking/allBookings`);
        if (response.data.success) {
          return response.data.bookings || [];
        }
        return [];
      } catch (err) {
        console.error("Error fetching calendar bookings:", err);
        return [];
      }
    }, 
    staleTime: 1000 * 60 * 1, // 1 minute for now .......
  });

  // Transform backend bookings to calendar format
  const BOOKINGS = fetchedBookings.map((b) => {
    // Parse date to YYYY-MM-DD format
    const dateObj = new Date(b.date);
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    const formattedDate = `${year}-${month}-${day}`;

    // Determine hall from venue
    const hallChar = b.venue?.toLowerCase().includes("hall a") 
      ? "a" 
      : b.venue?.toLowerCase().includes("hall b") 
      ? "b" 
      : "a";

    return {
      id: b.id,
      hall: hallChar,
      date: formattedDate,
      client: b.client,
      event: b.event,
      package: b.package_name || b.package,
      status: b.status,
    };
  });

  const yr = current.getFullYear();
  const mo = current.getMonth();

  // Build a map: day → bookings[]
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
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === yr && today.getMonth() === mo;

  // Blank leading cells + actual day numbers
  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedBookings = selectedDay ? (bMap[selectedDay] || []) : [];

  // ── Tab styles ──────────────────────────────────────────────────────────
  const tabBase = {
    padding: "7px 18px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .12s",
    background: "#fff",
    color: "#6b7280",
  };
  const tabStyles = {
    both: {
      ...(view === "both"
        ? { background: "#f3f4f6", color: "#111827", border: "1px solid #9ca3af" }
        : tabBase),
    },
    a: {
      ...(view === "a"
        ? { background: "#FCEBEB", color: "#A32D2D", border: "1px solid #F7C1C1" }
        : tabBase),
    },
    b: {
      ...(view === "b"
        ? { background: "#E6F1FB", color: "#185FA5", border: "1px solid #B5D4F4" }
        : tabBase),
    },
  };

  return (
    <div style={{ padding: 32 }}>
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading calendar...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#dc2626" }}>
          <p style={{ fontSize: 14 }}>Failed to load bookings. Please try again.</p>
        </div>
      )}
      
      {!isLoading && !error && (
      <>
      {/* ── Top navigation ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {/* Left: title */}
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>
            Hall Bookings
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>
            Visual overview of booked dates by hall
          </p>
        </div>

        {/* Centre: hall tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "both", label: "Both halls" },
            { key: "a",    label: "Hall A" },
            { key: "b",    label: "Hall B" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setView(key); setSelectedDay(null); }}
              style={{ ...tabBase, ...tabStyles[key] }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: month navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => { setCurrent(new Date(yr, mo - 1, 1)); setSelectedDay(null); }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              border: "1px solid #d1fae5", background: "#fff",
              cursor: "pointer", fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ‹
          </button>
          <span style={{ fontWeight: 600, minWidth: 160, textAlign: "center", fontSize: 14 }}>
            {MONTH_NAMES[mo]} {yr}
          </span>
          <button
            onClick={() => { setCurrent(new Date(yr, mo + 1, 1)); setSelectedDay(null); }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              border: "1px solid #d1fae5", background: "#fff",
              cursor: "pointer", fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {(view === "both" || view === "a") && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#F09595", display: "inline-block" }} />
            Hall A — booked
          </div>
        )}
        {(view === "both" || view === "b") && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#85B7EB", display: "inline-block" }} />
            Hall B — booked
          </div>
        )}
      </div>

      {/* ── Main layout: calendar + sidebar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* Calendar grid */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", overflow: "hidden" }}>
          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f0fdf4" }}>
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                style={{
                  padding: "11px 0", textAlign: "center",
                  fontWeight: 700, fontSize: 11, color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{ minHeight: 84, borderBottom: "1px solid #f0fdf4", borderRight: "1px solid #f0fdf4" }}
                  />
                );
              }

              const bookings = bMap[day] || [];
              const isToday = isCurrentMonth && today.getDate() === day;
              const isSel = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  style={{
                    minHeight: 84,
                    padding: 8,
                    borderBottom: "1px solid #f0fdf4",
                    borderRight: "1px solid #f0fdf4",
                    cursor: "pointer",
                    background: isSel ? "#f0fdf4" : "transparent",
                    transition: "background .1s",
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "#fafafa"; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Day number */}
                  {isToday ? (
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: "#E24B4A", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, marginBottom: 4,
                      }}
                    >
                      {day}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 13, fontWeight: isSel ? 700 : 500,
                        color: isSel ? "#10b981" : "#475569", marginBottom: 4,
                      }}
                    >
                      {day}
                    </div>
                  )}

                  {/* Booking pills */}
                  {bookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        marginBottom: 2,
                        borderRadius: 5,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        background: b.hall === "a" ? "#F7C1C1" : "#B5D4F4",
                        color:      b.hall === "a" ? "#791F1F" : "#0C447C",
                      }}
                    >
                      {b.client.split("&")[0].trim()}
                    </div>
                  ))}
                  {bookings.length > 2 && (
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      +{bookings.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side panel ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", padding: 22 }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
            {selectedDay
              ? `${MONTH_NAMES[mo]} ${selectedDay}, ${yr}`
              : "Select a date"}
          </p>

          {!selectedDay && (
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", paddingTop: 32 }}>
              Click any date to see its bookings
            </p>
          )}

          {selectedDay && selectedBookings.length === 0 && (
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", paddingTop: 32 }}>
              No bookings for this date
            </p>
          )}

          {selectedBookings.map((b) => (
            <BookingChip key={b.id} booking={b} />
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}