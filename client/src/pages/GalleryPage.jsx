import { useState } from "react";

export default function GalleryLinks({ showToast }) {
  const [links, setLinks] = useState([
    { id: 1, label: "Main Wedding Gallery 2026", url: "https://reachbot.studio/gallery/2026", clicks: 142, active: true },
    { id: 2, label: "Mehndi Highlights", url: "https://reachbot.studio/gallery/mehndi", clicks: 87, active: true },
    { id: 3, label: "Baraat Collection", url: "https://reachbot.studio/gallery/baraat", clicks: 63, active: false },
    { id: 4, label: "Walima Premium Shots", url: "https://reachbot.studio/gallery/walima", clicks: 210, active: true },
  ]);

  const toggle = (id) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
    showToast("Gallery link updated");
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Gallery Links</h1>
          <p style={{ color: "#94a3b8" }}>Auto-sent when users reply "2"</p>
        </div>
        <button 
          onClick={() => setLinks(prev => [...prev, { id: Date.now(), label: "New Gallery", url: "", clicks: 0, active: true }])}
          style={{ padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12 }}
        >
          + Add Gallery
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {links.map(l => (
          <div key={l.id} style={{ 
            background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", 
            padding: 20, opacity: l.active ? 1 : 0.6 
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ fontSize: 32 }}>📸</div>
              <div style={{ flex: 1 }}>
                <input 
                  value={l.label} 
                  onChange={e => setLinks(prev => prev.map(x => x.id === l.id ? {...x, label: e.target.value} : x))}
                  style={{ fontWeight: 600, fontSize: 15, border: "none", width: "100%", background: "none" }}
                />
                <input 
                  value={l.url} 
                  onChange={e => setLinks(prev => prev.map(x => x.id === l.id ? {...x, url: e.target.value} : x))}
                  style={{ width: "100%", padding: 8, borderRadius: 10, border: "1px solid #d1fae5", marginTop: 8 }}
                  placeholder="https://..."
                />
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>👆 {l.clicks} clicks</p>
              </div>
              <button onClick={() => toggle(l.id)} style={{
                width: 48, height: 26, borderRadius: 99, background: l.active ? "#10b981" : "#cbd5e1",
                border: "none", position: "relative", cursor: "pointer"
              }}>
                <div style={{ 
                  position: "absolute", top: 3, left: l.active ? 24 : 3, 
                  width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "0.2s" 
                }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}