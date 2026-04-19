import { useState } from "react";

export default function Reminders({ showToast }) {
  const reminders = [
    { client: "Ahmed & Sana Raza", phone: "+923001234567", wedding: "Apr 21, 2026", daysLeft: 2 },
    { client: "Sara & Ali Khan", phone: "+923009876543", wedding: "Apr 23, 2026", daysLeft: 4 },
    { client: "Fatima & Usman", phone: "+923331122334", wedding: "May 10, 2026", daysLeft: 21 },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Smart Reminders</h1>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>Auto-triggered based on wedding dates</p>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 20, padding: 24, marginBottom: 24 }}>
        <p style={{ fontWeight: 600, color: "#92400e" }}>Urgent Reminders ({reminders.filter(r => r.daysLeft <= 4).length})</p>
        {reminders.filter(r => r.daysLeft <= 4).map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: i > 0 ? "1px solid #fde68a" : "none" }}>
            <div>
              <p style={{ fontWeight: 600 }}>{r.client}</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>{r.wedding}</p>
            </div>
            <button 
              onClick={() => showToast(`Reminder sent to ${r.client}`)}
              style={{ padding: "8px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12 }}
            >
              Send Now
            </button>
          </div>
        ))}
      </div>

      <p style={{ color: "#64748b" }}>All reminders timeline (expandable)</p>
    </div>
  );
}