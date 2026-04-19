import { useState } from "react";
import { BOOKINGS } from "../data/mockData";

export default function CalendarView() {
  const [current, setCurrent] = useState(new Date(2026, 3, 1)); // April 2026
  const [sel, setSel] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const yr = current.getFullYear();
  const mo = current.getMonth();

  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();

  const bMap = {};
  BOOKINGS.forEach(b => {
    const d = new Date(b.date);
    if (d.getFullYear() === yr && d.getMonth() === mo) {
      const day = d.getDate();
      if (!bMap[day]) bMap[day] = [];
      bMap[day].push(b);
    }
  });

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Calendar</h1>
          <p style={{ color: "#94a3b8" }}>Visual overview of all booked wedding dates</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setCurrent(new Date(yr, mo - 1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #d1fae5" }}>‹</button>
          <span style={{ fontWeight: 600, minWidth: 180, textAlign: "center" }}>{monthNames[mo]} {yr}</span>
          <button onClick={() => setCurrent(new Date(yr, mo + 1, 1))} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #d1fae5" }}>›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Calendar Grid */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f0fdf4" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} style={{ padding: "12px 0", textAlign: "center", fontWeight: 700, fontSize: 12, color: "#64748b" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, i) => (
              <div
                key={i}
                onClick={() => day && setSel(day)}
                style={{
                  minHeight: 90, padding: 8, borderBottom: "1px solid #f0fdf4", borderRight: "1px solid #f0fdf4",
                  background: sel === day ? "#f0fdf4" : "transparent", cursor: day ? "pointer" : "default"
                }}
              >
                {day && (
                  <>
                    <span style={{ fontWeight: sel === day ? 700 : 500, color: sel === day ? "#10b981" : "#475569" }}>{day}</span>
                    {bMap[day] && bMap[day].slice(0, 2).map((b, idx) => (
                      <div key={idx} style={{ fontSize: 10, padding: "2px 6px", marginTop: 4, borderRadius: 6, background: b.color + "20", color: b.color }}>
                        {b.client.split("&")[0].trim()}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Details */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", padding: 24 }}>
          <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            {sel ? `${monthNames[mo]} ${sel}, ${yr}` : "Select a date"}
          </p>
          {sel && (bMap[sel] || []).map(b => (
            <div key={b.id} style={{ padding: 16, background: "#f0fdf4", borderRadius: 14, marginBottom: 12 }}>
              <p style={{ fontWeight: 600 }}>{b.client}</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>{b.event} • {b.package}</p>
              <p style={{ fontSize: 11, color: "#10b981" }}>{b.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}