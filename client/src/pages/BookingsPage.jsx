
import { useState } from "react";
import { BOOKINGS } from "../data/mockData";

export default function Bookings({ showToast }) {
  const [bookings, setBookings] = useState(BOOKINGS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ client: "", phone: "", date: "", event: "", package: "Standard", status: "Pending", addons: [] });

  const save = () => {
    setBookings(prev => [...prev, { ...form, id: Date.now(), color: "#10b981" }]);
    setModal(false);
    showToast("Booking created successfully!");
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Bookings</h1>
          <p style={{ color: "#94a3b8" }}>Manage all wedding bookings</p>
        </div>
        <button onClick={() => setModal(true)} style={{ padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12 }}>+ New Booking</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {bookings.map(b => (
          <div key={b.id} style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", overflow: "hidden" }}>
            <div style={{ height: 6, background: b.color }} />
            <div style={{ padding: 20 }}>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{b.client}</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>{b.event} • {b.package}</p>
              <p style={{ fontSize: 11, color: "#10b981", marginTop: 8 }}>{b.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal can be expanded later */}
    </div>
  );
}