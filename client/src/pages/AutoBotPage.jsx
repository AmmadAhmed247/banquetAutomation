import { useState } from "react";
import { INIT_RULES } from "../data/mockData";

export default function AutoBot({ showToast }) {
  const [rules, setRules] = useState(INIT_RULES);

  const toggle = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    showToast("Rule updated");
  };

  const update = (id, field, val) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#1e293b" }}>Auto Reply Bot</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>WhatsApp keyword triggers via Twilio</p>
        </div>
        <button onClick={() => {
          setRules(prev => [...prev, { id: Date.now(), trigger: "Custom Trigger", keyword: "", response: "", active: true, type: "custom" }]);
          showToast("New rule added");
        }} style={{ padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600 }}>
          + Add Rule
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rules.map(rule => (
          <div key={rule.id} style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: 20,
            opacity: rule.active ? 1 : 0.6
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                ✨
              </div>
              <div style={{ flex: 1 }}>
                <input
                  value={rule.trigger}
                  onChange={e => update(rule.id, "trigger", e.target.value)}
                  style={{ fontSize: 16, fontWeight: 600, border: "none", background: "none", width: "100%", marginBottom: 8 }}
                />
                <textarea
                  value={rule.response}
                  onChange={e => update(rule.id, "response", e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d1fae5", resize: "vertical" }}
                />
              </div>
              <button
                onClick={() => toggle(rule.id)}
                style={{
                  width: 48, height: 26, borderRadius: 99, border: "none",
                  background: rule.active ? "#10b981" : "#cbd5e1",
                  position: "relative", cursor: "pointer"
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: rule.active ? 24 : 3,
                  width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "all 0.2s"
                }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}