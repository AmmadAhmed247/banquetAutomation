import { BOOKINGS } from "../data/mockData";

export default function Dashboard({ setActive }) {
  const stats = [
    { label: "Total Clients", value: "48", sub: "+3 this week", icon: "◎", c: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { label: "Weddings This Month", value: "6", sub: "2 upcoming", icon: "✦", c: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { label: "Messages Sent Today", value: "312", sub: "via Twilio", icon: "✉", c: "#6366f1", bg: "rgba(99,102,241,0.08)" },
    { label: "Auto Replies", value: "89", sub: "This week", icon: "⚡", c: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  ];

  const alerts = [
    { type: "red", msg: "Ahmed & Sana Raza — Wedding in 2 days! Auto reminder queued.", action: "Send Now" },
    { type: "amber", msg: "Sara & Ali Khan — Cold drinks addon reminder due in 1 day.", action: "Send" },
    { type: "green", msg: "Fatima & Usman — Booking fully confirmed. All addons set.", action: "View" },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#1e293b", margin: 0 }}>Good morning ✨</h1>
        <p style={{ color: "#94a3b8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginTop: 4 }}>Here's your studio overview for today</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.c, marginBottom: 14 }}>{s.icon}</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#1e293b", margin: 0 }}>{s.value}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#10b981", marginTop: 2, fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Smart Alerts */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", padding: 24 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#1e293b", marginBottom: 16, fontSize: 15 }}>Smart Alerts</p>
          {alerts.map((a, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 14, marginBottom: 10, background: a.type === "red" ? "#fef2f2" : a.type === "amber" ? "#fffbeb" : "#f0fdf4" }}>
              <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>{a.msg}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Weddings */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", padding: 24 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "#1e293b", marginBottom: 16, fontSize: 15 }}>Upcoming Weddings</p>
          {BOOKINGS.slice(0, 4).map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, background: "#f0fdf4", marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#d1fae5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#059669", fontWeight: 700, fontSize: 12 }}>{new Date(b.date).getDate()}</span>
                <span style={{ color: "#34d399", fontSize: 10 }}>{new Date(b.date).toLocaleDateString("en", { month: "short" })}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{b.client}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{b.event} · {b.package}</p>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, background: "#d1fae5", color: "#059669" }}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}