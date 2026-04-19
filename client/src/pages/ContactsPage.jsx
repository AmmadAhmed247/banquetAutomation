import { useState } from "react";
import { CONTACTS } from "../data/mockData";

export default function Contacts({ showToast }) {
  const [contacts, setContacts] = useState(CONTACTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", tag: "Inquiry", weddingDate: "", event: "", package: "Basic" });

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const save = () => {
    if (!form.name || !form.phone) return;
    const newContact = {
      ...form,
      id: Date.now(),
      avatar: form.name.split(/[\s&]+/).map(w => w[0]).join("").toUpperCase(),
      lastMsg: "New contact",
      lastTime: "Now",
      unread: 0
    };
    setContacts(prev => [...prev, newContact]);
    setModal(false);
    setForm({ name: "", phone: "", tag: "Inquiry", weddingDate: "", event: "", package: "Basic" });
    showToast("Contact added successfully!");
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700 }}>Contacts</h1>
          <p style={{ color: "#94a3b8" }}>{contacts.length} clients</p>
        </div>
        <button onClick={() => setModal(true)} style={{ padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600 }}>
          + Add Client
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #d1fae5", overflow: "hidden" }}>
        <div style={{ padding: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d1fae5" }} />
        </div>

        {/* Table would go here - simplified for brevity */}
        <p style={{ padding: 20, color: "#64748b" }}>Full contacts table (you can expand this later)</p>
      </div>

      {/* Add Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 24, width: 480 }}>
            <h2>Add New Client</h2>
            {/* Form fields here - you can expand */}
            <button onClick={save} style={{ marginTop: 20, padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: 12 }}>Save Client</button>
            <button onClick={() => setModal(false)} style={{ marginLeft: 10 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}