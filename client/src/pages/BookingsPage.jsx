import { useState } from "react";
import {
  CalendarDays, Phone, Users, MapPin, Tag,
  PlusCircle, X, CheckCircle2, Clock, XCircle,
  CreditCard, Wallet, ChevronDown, Search, LayoutGrid,
  Pencil, Save
} from "lucide-react";

const BOOKINGS = [
  { id: 1, client: "Ayesha & Bilal", phone: "+92 300 1234567", date: "2025-06-15", event: "Wedding", package: "Premium", status: "Confirmed", guests: 350, venue: "Emerald Hall", totalAmount: 850000, advancePaid: 300000, paymentMethod: "Bank Transfer", paymentNote: "Token received" },
  { id: 2, client: "Sara & Ahmed", phone: "+92 301 9876543", date: "2025-07-20", event: "Walima", package: "Standard", status: "Pending", guests: 200, venue: "Garden Pavilion", totalAmount: 450000, advancePaid: 100000, paymentMethod: "Cash", paymentNote: "" },
  { id: 3, client: "Fatima & Usman", phone: "+92 333 5556677", date: "2025-08-10", event: "Engagement", package: "Basic", status: "Confirmed", guests: 150, venue: "Emerald Hall", totalAmount: 280000, advancePaid: 280000, paymentMethod: "Online", paymentNote: "Fully paid" },
  { id: 4, client: "Hina & Zain", phone: "+92 321 4443322", date: "2025-09-05", event: "Mehndi", package: "Premium", status: "Cancelled", guests: 400, venue: "Garden Pavilion", totalAmount: 950000, advancePaid: 200000, paymentMethod: "Cash", paymentNote: "Partial refund pending" },
  { id: 5, client: "Nadia & Omar", phone: "+92 312 7778899", date: "2025-10-18", event: "Wedding", package: "Standard", status: "Pending", guests: 250, venue: "Emerald Hall", totalAmount: 550000, advancePaid: 0, paymentMethod: "Bank Transfer", paymentNote: "" },
  { id: 6, client: "Zara & Hassan", phone: "+92 345 1112233", date: "2025-11-22", event: "Barat", package: "Premium", status: "Confirmed", guests: 500, venue: "Garden Pavilion", totalAmount: 1200000, advancePaid: 500000, paymentMethod: "Online", paymentNote: "2nd installment due" },
];

const EVENTS = ["Wedding", "Walima", "Mehndi", "Barat", "Engagement", "Birthday", "Corporate"];

const VENUES = ["Room A ", "Room B"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online", "Cheque"];
const STATUSES = ["Pending", "Confirmed", "Cancelled"];

const emptyForm = {
  client: "", phone: "", date: "", event: "Wedding",
  status: "Pending", guests: "", venue: "Emerald Hall",
  totalAmount: "", advancePaid: "", paymentMethod: "Cash", paymentNote: "",
};

const statusConfig = {
  Confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: CheckCircle2, bar: "bg-green-500" },
  Pending:   { bg: "bg-amber-50",  text: "text-amber-600", border: "border-amber-200", icon: Clock,         bar: "bg-amber-400" },
  Cancelled: { bg: "bg-red-50",    text: "text-red-500",   border: "border-red-200",   icon: XCircle,       bar: "bg-red-400"   },
};

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

function PaymentBar({ total, advance }) {
  if (!total) return null;
  const pct = Math.min(100, Math.round(((advance || 0) / total) * 100));
  const remaining = total - (advance || 0);
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-green-500 font-semibold mb-1">
        <span>Advance: {formatPKR(advance)}</span>
        <span>{pct}% paid</span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-1.5">
        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-red-400 font-medium mt-1">Remaining: {formatPKR(remaining)}</p>
    </div>
  );
}

// Reusable field input
function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-green-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-green-300";
const selectCls = "w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none cursor-pointer";

function BookingModal({ booking, onClose, onSave, isNew }) {
  const [form, setForm] = useState(booking);
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const remaining = Number(form.totalAmount || 0) - Number(form.advancePaid || 0);
  const pct = form.totalAmount ? Math.min(100, Math.round((Number(form.advancePaid || 0) / Number(form.totalAmount)) * 100)) : 0;

  return (
    <div className="fixed inset-0 bg-green-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-green-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              {isNew ? <PlusCircle size={18} className="text-green-600" /> : <Pencil size={18} className="text-green-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900" style={{ fontFamily: "Georgia, serif" }}>
                {isNew ? "New Booking" : "Edit Booking"}
              </h2>
              <p className="text-xs text-green-400">{isNew ? "Fill in all reservation details" : `Editing: ${booking.client}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-green-300 hover:text-green-600 cursor-pointer border-none bg-transparent p-1 rounded-lg hover:bg-green-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Client Info */}
          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={12} /> Client Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Client Name *">
                  <input type="text" placeholder="e.g. Ayesha & Bilal" value={form.client} onChange={e => f("client", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Phone">
                <input type="text" placeholder="+92 300 0000000" value={form.phone} onChange={e => f("phone", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Guests">
                <input type="number" placeholder="250" value={form.guests} onChange={e => f("guests", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Event Details */}
          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarDays size={12} /> Event Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Event Type", key: "event", options: EVENTS },
                { label: "Venue", key: "venue", options: VENUES },
                { label: "Status", key: "status", options: STATUSES },
              ].map(fi => (
                <Field key={fi.key} label={fi.label}>
                  <div className="relative">
                    <select value={form[fi.key]} onChange={e => f(fi.key, e.target.value)} className={selectCls}>
                      {fi.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
                  </div>
                </Field>
              ))}
              <div className="col-span-2">
                <Field label="Event Date *">
                  <input type="date" value={form.date} onChange={e => f("date", e.target.value)} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CreditCard size={12} /> Payment Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Amount (PKR)">
                <input type="number" placeholder="e.g. 850000" value={form.totalAmount} onChange={e => f("totalAmount", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Advance Paid (PKR)">
                <input type="number" placeholder="e.g. 300000" value={form.advancePaid} onChange={e => f("advancePaid", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Payment Method">
                <div className="relative">
                  <select value={form.paymentMethod} onChange={e => f("paymentMethod", e.target.value)} className={selectCls}>
                    {PAYMENT_METHODS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Payment Note">
                <input type="text" placeholder="e.g. Token received" value={form.paymentNote} onChange={e => f("paymentNote", e.target.value)} className={inputCls} />
              </Field>
            </div>

            {/* Live Payment Preview */}
            {form.totalAmount ? (
              <div className="mt-4 bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="flex justify-between text-xs font-semibold text-green-700 mb-2">
                  <span>Total: {formatPKR(form.totalAmount)}</span>
                  <span className="text-red-400">Remaining: {formatPKR(remaining > 0 ? remaining : 0)}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-green-500">Advance: {formatPKR(form.advancePaid || 0)}</span>
                  <span className="text-[11px] text-green-500 font-bold">{pct}% paid</span>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 pb-7">
          <button onClick={onClose} className="flex-1 border border-green-200 text-green-600 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer bg-transparent">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2"
          >
            {isNew ? <PlusCircle size={15} /> : <Save size={15} />}
            {isNew ? "Save Booking" : "Update Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Bookings({ showToast }) {
  const [bookings, setBookings] = useState(BOOKINGS);
  const [modal, setModal] = useState(null); // null | { mode: 'new' | 'edit', booking }
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const openNew = () => setModal({ mode: "new", booking: { ...emptyForm, id: Date.now() } });
  const openEdit = (b) => setModal({ mode: "edit", booking: { ...b } });
  const closeModal = () => setModal(null);

  const handleSave = (form) => {
    if (!form.client || !form.date) return;
    if (modal.mode === "new") {
      setBookings(prev => [...prev, { ...form, id: Date.now() }]);
      showToast?.("Booking created successfully!");
    } else {
      setBookings(prev => prev.map(b => b.id === form.id ? form : b));
      showToast?.("Booking updated successfully!");
    }
    closeModal();
  };

  const filtered = bookings
    .filter(b => filter === "All" || b.status === filter)
    .filter(b =>
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.event.toLowerCase().includes(search.toLowerCase())
    );

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: LayoutGrid, color: "text-green-600", bg: "bg-green-50" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: bookings.filter(b => b.status === "Pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Revenue", value: "PKR " + (bookings.reduce((a, b) => a + Number(b.totalAmount || 0), 0) / 1000000).toFixed(1) + "M", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="min-h-screen bg-green-50 p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-green-500 text-xs font-semibold tracking-widest uppercase mb-1">Management</p>
          <h1 className="text-4xl font-bold text-green-900 font-mono " >Bookings</h1>
          <p className="text-green-500 text-sm mt-1">All banquet reservations in one place</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 hover:-translate-y-0.5 border-none cursor-pointer"
        >
          <PlusCircle size={16} /> New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{s.value}</div>
              <div className="text-xs text-green-400 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client or event..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-green-200 rounded-xl text-green-900 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Confirmed", "Pending", "Cancelled"].map(f2 => (
            <button
              key={f2}
              onClick={() => setFilter(f2)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer ${
                filter === f2
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-green-600 border-green-200 hover:border-green-400"
              }`}
            >
              {f2}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-green-400 font-medium">{filtered.length} bookings</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map(b => {
          const sc = statusConfig[b.status];
          const StatusIcon = sc.icon;
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-green-100 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`h-1.5 w-full ${sc.bar}`} />
              <div className="p-5">

                {/* Client + Status + Edit btn */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-green-900">{b.client}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={11} className="text-green-400" />
                      <p className="text-xs text-green-400">{b.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                      <StatusIcon size={11} />
                      {b.status}
                    </span>
                    <button
                      onClick={() => openEdit(b)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-1.5 cursor-pointer"
                      title="Edit booking"
                    >
                      <Pencil size={13} className="text-green-600" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-green-50 mb-3" />

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Tag size={10} className="text-green-400" />
                      <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Event</p>
                    </div>
                    <p className="text-sm font-bold text-green-800">{b.event}</p>
                  </div>
                 
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <CalendarDays size={10} className="text-green-400" />
                      <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Date</p>
                    </div>
                    <p className="text-sm font-bold text-green-800">
                      {new Date(b.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Users size={10} className="text-green-400" />
                      <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Guests</p>
                    </div>
                    <p className="text-sm font-bold text-green-800">{b.guests}</p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2 mb-3">
                  <MapPin size={12} className="text-green-500" />
                  <p className="text-xs font-semibold text-green-700">{b.venue}</p>
                </div>

                {/* Payment */}
                <div className="border-t border-green-50 pt-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard size={11} className="text-green-500" />
                    <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Payment</p>
                    <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">{b.paymentMethod}</span>
                  </div>
                  <p className="text-sm font-bold text-green-900">{formatPKR(b.totalAmount)}</p>
                  {b.paymentNote && <p className="text-[10px] text-green-400 italic mt-0.5">{b.paymentNote}</p>}
                  <PaymentBar total={b.totalAmount} advance={b.advancePaid} />
                </div>

                {/* Edit CTA at bottom */}
                <button
                  onClick={() => openEdit(b)}
                  className="mt-4 w-full flex items-center justify-center gap-2 border border-green-200 text-green-600 text-xs font-semibold py-2 rounded-xl hover:bg-green-50 transition-colors cursor-pointer bg-transparent opacity-0 group-hover:opacity-100 duration-200"
                >
                  <Pencil size={12} /> Edit Booking
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <BookingModal
          booking={modal.booking}
          isNew={modal.mode === "new"}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}