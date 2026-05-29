import { useState } from "react";
import { useForm } from "react-hook-form";
import contactService from "../services/contacts.service";

const INITIAL_CONTACTS = [
  { id: 1, name: "Ayesha & Bilal", phone: "+92 300 1234567", tag: "Confirmed", weddingDate: "2025-03-15", event: "Wedding", package: "Premium", avatar: "AB", lastMsg: "Thank you so much!", lastTime: "2h ago", unread: 0 },
  { id: 2, name: "Sara Khan", phone: "+92 321 9876543", tag: "Inquiry", weddingDate: "", event: "Bridal Shoot", package: "Basic", avatar: "SK", lastMsg: "What are your packages?", lastTime: "5h ago", unread: 2 },
  { id: 3, name: "Fatima & Omar", phone: "+92 333 5551234", tag: "Follow-up", weddingDate: "2025-06-20", event: "Nikkah + Reception", package: "Elite", avatar: "FO", lastMsg: "Please send the contract", lastTime: "1d ago", unread: 1 },
];

const TAG_STYLES = {
  Confirmed: "bg-emerald-100 text-emerald-700",
  Inquiry: "bg-amber-100 text-amber-700",
  "Follow-up": "bg-blue-100 text-blue-700",
  Booked: "bg-violet-100 text-violet-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TAGS = Object.keys(TAG_STYLES);
const PACKAGES = ["Basic", "Standard", "Premium", "Elite"];
const EMPTY_FORM = { name: "", phone: "", tag: "Inquiry", weddingDate: "", event: "", package: "Basic" };

export default function Contacts({ showToast }) {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()\u0660-\u0669]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    return e;
  };

  const onSubmit = async (data) => {
    const initials = data.name
      .split(/[\s&]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    await contactService.addClient(data)

    setContacts((prev) => [
      ...prev,
      {
        ...data,
        id: Date.now(),
        avatar: initials,
        lastMsg: "New contact added",
        lastTime: "Just now",
        unread: 0,
      },
    ]);


    reset();
    setModal(false);
    showToast?.("✓ Contact added successfully!");
  };
  const handleDelete = () => {
    setContacts(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
    showToast?.("Contact removed.");
  };

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    reset();
  };
  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 font-body">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Contacts</h1>
          <p className="text-slate-400 mt-1 text-sm">{contacts.length} clients total</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold rounded-xl shadow-md shadow-emerald-200 transition-all duration-150"
        >
          <span className="text-lg leading-none">+</span> Add Client
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden font-body">
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Event</th>
                <th className="px-6 py-3 text-left">Package</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Wedding Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No contacts found.
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-emerald-50/40 transition-colors group">
                  {/* Client */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {c.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.lastTime}</p>
                      </div>
                      {c.unread > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Phone */}
                  <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                  {/* Event */}
                  <td className="px-6 py-4 text-slate-600">{c.event || "—"}</td>
                  {/* Package */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">{c.package}</span>
                  </td>
                  {/* Tag */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TAG_STYLES[c.tag] || "bg-slate-100 text-slate-600"}`}>
                      {c.tag}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-6 py-4 text-slate-500 text-xs">{c.weddingDate || "—"}</td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                      title="Delete contact"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD CLIENT MODAL ── */}
      {modal && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-800">Add New Client</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Fill in the client's details below</p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Client Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("name", { required: "Name is Required!" })}
                    placeholder="e.g. Ayesha & Bilal"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${errors.name ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:ring-emerald-100"}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("phone", { required: "Phone No is Required!" })}
                    placeholder="+92 300 1234567"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${errors.phone ? "border-red-300 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:ring-emerald-100"}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Event */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Event Type</label>
                  <input
                    {...register("event", { required: "Event Name is Required!" })}
                    placeholder="e.g. Wedding, Bridal Shoot, Nikkah"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                {/* Row: Package + Tag */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Package
                    </label>

                    <select
                      {...register("package", { required: "Package is required" })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a package
                      </option>

                      {PACKAGES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    {errors.package && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.package.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Status
                    </label>

                    <select
                      {...register("tag", { required: "Status is required" })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select status
                      </option>

                      {TAGS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    {errors.tag && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.tag.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Wedding Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Wedding Date</label>
                  <input
                    type="date"
                    {...register("weddingDate", { required: "Wedding Date is Required!" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold rounded-xl shadow-md shadow-emerald-100 transition-all duration-150 text-sm"
                >
                  Save Client
                </button>
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 mb-1">Remove Contact?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}