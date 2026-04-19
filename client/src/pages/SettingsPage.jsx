import { useState } from "react";

export default function Settings({ showToast }) {
  const [fields, setFields] = useState({
    sid: "ACxxxxxxxxxxxxxxxx",
    token: "••••••••••••••••",
    number: "+15005550006",
    calLink: "https://cal.com/reachbot-studio",
    studio: "ReachBot Studio",
    owner: "Studio Admin",
    email: "admin@studio.com",
    city: "Karachi"
  });

  const update = (key, value) => setFields(prev => ({ ...prev, [key]: value }));

  const saveSection = (name) => showToast(`${name} settings saved!`);

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Settings</h1>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>Twilio & Studio Configuration</p>

      {/* Twilio */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", padding: 24, marginBottom: 20 }}>
        <h3>Twilio Integration</h3>
        <input value={fields.sid} onChange={e => update("sid", e.target.value)} placeholder="Account SID" style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 12, border: "1px solid #d1fae5" }} />
        <input value={fields.token} onChange={e => update("token", e.target.value)} placeholder="Auth Token" style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 12, border: "1px solid #d1fae5" }} />
        <input value={fields.number} onChange={e => update("number", e.target.value)} placeholder="WhatsApp Number" style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 12, border: "1px solid #d1fae5" }} />
        <button onClick={() => saveSection("Twilio")} style={{ marginTop: 12, padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12 }}>Save Twilio</button>
      </div>

      {/* Other sections can be added similarly */}
      <button onClick={() => showToast("All settings saved!")} style={{ padding: "12px 28px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12, fontSize: 16 }}>
        Save All Settings
      </button>
    </div>
  );
}