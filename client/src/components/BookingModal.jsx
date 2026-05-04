import { useState } from "react";
import {
  CalendarDays, Phone, Users,
  PlusCircle, X, CreditCard, ChevronDown, Loader, Save, Pencil
} from "lucide-react";

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

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

const EVENTS = ["Wedding", "Walima", "Mehndi", "Barat", "Engagement", "Birthday", "Corporate"];
const VENUES = ["Room A", "Room B"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online", "Cheque"];
const STATUSES = ["Pending", "Confirmed", "Cancelled"];

export default function BookingModal({ booking, onClose, onSave, isNew, isLoading }) {
  const [form, setForm] = useState(booking);
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const remaining = Number(form.totalAmount || 0) - Number(form.advancePaid || 0);
  const pct = form.totalAmount ? Math.min(100, Math.round((Number(form.advancePaid || 0) / Number(form.totalAmount)) * 100)) : 0;
  console.log(booking);
  

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
          <button onClick={onClose} disabled={isLoading} className="text-green-300 hover:text-green-600 cursor-pointer border-none bg-transparent p-1 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50">
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
                  <input type="text" placeholder="e.g. Ayesha & Bilal" value={form.client} onChange={e => f("client", e.target.value)} className={inputCls} disabled={isLoading} />
                </Field>
              </div>
              <Field label="Phone *">
                <input type="text" placeholder="+92 300 0000000" value={form.phone} onChange={e => f("phone", e.target.value)} className={inputCls} disabled={isLoading} />
              </Field>
              <Field label="Guests">
                <input type="number" placeholder="250" value={form.guests} onChange={e => f("guests", e.target.value)} className={inputCls} disabled={isLoading} />
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
                { label: "Package", key: "package", options: ["Basic", "Standard", "Premium"] },
                { label: "Venue", key: "venue", options: VENUES },
                { label: "Status", key: "status", options: STATUSES },
              ].map(fi => (
                <Field key={fi.key} label={fi.label}>
                  <div className="relative">
                    <select value={form[fi.key]} onChange={e => f(fi.key, e.target.value)} className={selectCls} disabled={isLoading}>
                      {fi.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
                  </div>
                </Field>
              ))}
              <div className="col-span-2">
                <Field label="Event Date *">
                  <input type="date" value={form.date} onChange={e => f("date", e.target.value)} className={inputCls} disabled={isLoading} />
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
                <input type="number" placeholder="e.g. 850000" value={form.totalAmount} onChange={e => f("totalAmount", e.target.value)} className={inputCls} disabled={isLoading} />
              </Field>
              <Field label="Advance Paid (PKR)">
                <input type="number" placeholder="e.g. 300000" value={form.advancePaid} onChange={e => f("advancePaid", e.target.value)} className={inputCls} disabled={isLoading} />
              </Field>
              <Field label="Payment Method">
                <div className="relative">
                  <select value={form.paymentMethod} onChange={e => f("paymentMethod", e.target.value)} className={selectCls} disabled={isLoading}>
                    {PAYMENT_METHODS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Payment Note">
                <input type="text" placeholder="e.g. Token received" value={form.paymentNote || ""} onChange={e => f("paymentNote", e.target.value)} className={inputCls} disabled={isLoading} />
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
          <button onClick={onClose} disabled={isLoading} className="flex-1 border border-green-200 text-green-600 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer bg-transparent disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader size={15} className="animate-spin" /> : isNew ? <PlusCircle size={15} /> : <Save size={15} />}
            {isLoading ? "Saving..." : isNew ? "Save Booking" : "Update Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
