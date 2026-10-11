import { useState, useEffect } from "react";
import {
  CalendarDays, Users,
  PlusCircle, X, CreditCard, ChevronDown, Loader, Save, Pencil, Trash2, Plus,
} from "lucide-react";
import { getAllAddons, useCreateAddon, useDeleteAddon, useUpdateAddon, useMarkAddonReceived } from "../lib/hooks/addon.hook";
import { AddonRow } from "./Management/ManagementRows";

function formatPKR(val) {
  if (!val && val !== 0) return "—";
  return "PKR " + Number(val).toLocaleString("en-PK");
}

function formatDateInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function makePaymentId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function isBankMethod(method) {
  return !!(method && method !== "Cash");
}

function buildPaymentsFromBooking(booking) {
  if (!booking) return [];

  if (Array.isArray(booking.payments) && booking.payments.length > 0) {
    return booking.payments.map((p) => ({
      id: p.id || makePaymentId(),
      amount: p.amount != null && p.amount !== "" ? String(p.amount) : "",
      method: p.method || p.paymentMethod || p.payment_method || "Cash",
      bankName: p.bankName || p.bank_name || "",
      note: p.note || p.paymentNote || p.payment_note || "",
      date: p.date ? formatDateInput(p.date) : todayString(),
    }));
  }

  const paid = Number(booking.advancePaid ?? booking.advance_paid ?? 0);
  if (paid > 0) {
    const method = booking.paymentMethod || booking.payment_method || "Cash";
    return [
      {
        id: makePaymentId(),
        amount: String(paid),
        method,
        bankName: booking.bankName || booking.bank_name || "",
        note: booking.paymentNote || booking.payment_note || "",
        date: formatDateInput(booking.date) || todayString(),
      },
    ];
  }

  return [];
}

function normalizeBooking(booking) {
  if (!booking) return { payments: [] };
  return {
    ...booking,
    date: booking.date ? formatDateInput(booking.date) : "",
    advanceDueDate:
      booking.advanceDueDate ??
      ((booking.advance_due_date ? formatDateInput(booking.advance_due_date) : "") || ""),
    timeSlot: booking.timeSlot ?? booking.time_slot ?? "Night",
    bankName: booking.bankName ?? booking.bank_name ?? "",
    rNo: booking.rNo ?? booking.r_no ?? "",
    paymentMethod: booking.paymentMethod ?? booking.payment_method ?? "Cash",
    paymentNote: booking.paymentNote ?? booking.payment_note ?? "",
    settlementPaymentMethod:
      booking.settlementPaymentMethod ?? booking.payment_method ?? "Cash",
    settlementBankName: booking.settlementBankName ?? booking.bank_name ?? "",
    payments: buildPaymentsFromBooking(booking),
  };
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-green-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-green-300";
const selectCls =
  "w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none cursor-pointer";

const EVENTS = [
  "Wedding", "Valima", "Mehndi", "Barat", "Engagement",
  "Birthday", "Corporate", "Barat and Valima", "Nikah",
];
const VENUES = ["Hall A", "Hall B", "Hall A & B"];
const PAYMENT_METHODS = [
  "Cash", "JazzCash", "EasyPaisa", "Habib Metro Usman", "Meezan Bank Sadar",
];
const STATUSES = ["Pending", "Confirmed", "Cancelled", "Finished"];
const TIME_SLOTS = ["Afternoon", "Night"];
const ADDON_SERVICES = [
  "Pepsi Co.", "Coca Cola Co.", "Fresh Flower", "Cola Next", "Dance Floor",
  "Water Bottles", "Ayaz Tissue", "Stage", "Fire Crackers", "Ladies Staff",
  "BBQ", "Sound System", "Entry", "Decoration", "Miscellaneous",
];
const emptyAddon = { service: "", description: "", client_price: "", vendor_cost: "" };

function AddonPopup({ draft, setDraft, onSubmit, onClose, isLoading }) {
  return (
    <div className="fixed inset-0 bg-green-950/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-green-100 p-2 rounded-xl">
              <CreditCard size={16} className="text-green-600" />
            </div>
            <h3 className="text-[15px] font-bold text-green-900">Add Add-on</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-green-300 hover:text-green-600 cursor-pointer border-none bg-transparent p-1 rounded-lg hover:bg-green-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Service">
            <div className="relative">
              <select
                value={draft.service}
                onChange={(e) => setDraft((d) => ({ ...d, service: e.target.value }))}
                className={selectCls}
                disabled={isLoading}
              >
                <option value="" disabled>
                  Select service...
                </option>
                {ADDON_SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none"
              />
            </div>
          </Field>

          <Field label="Description / Notes">
            <input
              type="text"
              placeholder="Description / Notes"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className={inputCls}
              disabled={isLoading}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Client Price">
              <input
                type="number"
                placeholder="Client Price"
                value={draft.client_price}
                onChange={(e) => setDraft((d) => ({ ...d, client_price: e.target.value }))}
                className={inputCls}
                disabled={isLoading}
              />
            </Field>
            <Field label="Vendor Cost">
              <input
                type="number"
                placeholder="Vendor Cost"
                value={draft.vendor_cost}
                onChange={(e) => setDraft((d) => ({ ...d, vendor_cost: e.target.value }))}
                className={inputCls}
                disabled={isLoading}
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-green-200 text-green-600 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !draft.service}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl cursor-pointer border-none disabled:opacity-50"
          >
            Add Add-on
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingModal({ booking, onClose, onSave, isNew, isLoading }) {
  const [form, setForm] = useState(() => normalizeBooking(booking));
  const [addonDraft, setAddonDraft] = useState(emptyAddon);
  const [showAddonPopup, setShowAddonPopup] = useState(false);

  const addonQueryResult = getAllAddons();
  const rawAddons =
    addonQueryResult?.data?.addons ?? addonQueryResult?.data ?? addonQueryResult ?? [];
  const allAddonsList = Array.isArray(rawAddons)
    ? rawAddons.map((a) => ({ ...a, id: a.id || a._id }))
    : [];

  const createAddon = useCreateAddon();
  const deleteAddon = useDeleteAddon();
  const updateAddon = useUpdateAddon();
  const markAddonReceived = useMarkAddonReceived?.() || {
    mutate: (id, payload) => {
      updateAddon.mutate({ id, data: payload });
    },
  };

  const addonRows =
    !isNew && booking?.id
      ? allAddonsList.filter((a) => (a.bookingId ?? a.booking_id) === booking.id)
      : [];

  useEffect(() => {
    setForm(normalizeBooking(booking));
  }, [booking]);

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const payments = Array.isArray(form.payments) ? form.payments : [];
  const paidTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalAmount = Number(form.totalAmount || 0);
  const remaining =
    form.status === "Finished" ? 0 : Math.max(0, totalAmount - paidTotal);
  const pct =
    form.status === "Finished"
      ? 100
      : totalAmount
        ? Math.min(100, Math.round((paidTotal / totalAmount) * 100))
        : 0;

  function addPayment() {
    setForm((p) => ({
      ...p,
      payments: [
        ...(p.payments || []),
        {
          id: makePaymentId(),
          amount: "",
          method: "Cash",
          bankName: "",
          note: "",
          date: todayString(),
        },
      ],
    }));
  }

  function updatePayment(id, key, value) {
    setForm((p) => ({
      ...p,
      payments: (p.payments || []).map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [key]: value };
        if (key === "method" && value === "Cash") {
          next.bankName = "";
        }
        return next;
      }),
    }));
  }

  function removePayment(id) {
    setForm((p) => ({
      ...p,
      payments: (p.payments || []).filter((row) => row.id !== id),
    }));
  }

  function handleSave() {
    const cleanPayments = (form.payments || [])
      .filter((p) => Number(p.amount) > 0)
      .map((p) => ({
        id: p.id,
        amount: Number(p.amount || 0),
        method: p.method || "Cash",
        bankName: p.bankName || "",
        note: p.note || "",
        date: p.date || todayString(),
      }));

    const paid = cleanPayments.reduce((s, p) => s + p.amount, 0);
    const primary = cleanPayments[0];

    onSave({
      ...form,
      payments: cleanPayments,
      advancePaid: paid,
      advanceAmount: form.advanceAmount || paid,
      paymentMethod: primary?.method || form.paymentMethod || "Cash",
      bankName: primary?.bankName || form.bankName || "",
      paymentNote: primary?.note || form.paymentNote || "",
    });
  }

  function submitAddon() {
    if (!addonDraft.service || isNew || !booking?.id) return;
    createAddon.mutate(
      {
        bookingId: booking.id,
        ...addonDraft,
        client_price: Number(addonDraft.client_price || 0),
        vendor_cost: Number(addonDraft.vendor_cost || 0),
      },
      { onSuccess: () => setShowAddonPopup(false) }
    );
    setAddonDraft(emptyAddon);
  }

  function removeAddonRow(id) {
    deleteAddon.mutate(id);
  }

  function handleUpdateAddon(id, updatedData) {
    updateAddon.mutate({
      id,
      data: {
        ...updatedData,
        client_price: Number(updatedData.client_price || 0),
        vendor_cost: Number(updatedData.vendor_cost || 0),
      },
    });
  }

  function handleMarkReceived(id, payload) {
    markAddonReceived.mutate({ id, ...payload });
  }

  return (
    <div className="fixed inset-0 bg-green-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-green-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl">
              {isNew ? (
                <PlusCircle size={18} className="text-green-600" />
              ) : (
                <Pencil size={18} className="text-green-600" />
              )}
            </div>
            <div>
              <h2
                className="text-xl font-bold text-green-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {isNew ? "New Booking" : "Edit Booking"}
              </h2>
              <p className="text-xs text-green-400">
                {isNew
                  ? "Fill in all reservation details"
                  : `Editing: ${booking?.client || ""}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-green-300 hover:text-green-600 cursor-pointer border-none bg-transparent p-1 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Pencil size={12} /> Receipt Info
            </p>
            <Field label="R. No.">
              <input
                type="text"
                placeholder="e.g. 730"
                value={form.rNo || ""}
                onChange={(e) => f("rNo", e.target.value)}
                className={inputCls}
                disabled={isLoading}
              />
            </Field>
          </section>

          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users size={12} /> Client Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Client Name *">
                  <input
                    type="text"
                    placeholder="e.g. Ayesha & Bilal"
                    value={form.client || ""}
                    onChange={(e) => f("client", e.target.value)}
                    className={inputCls}
                    disabled={isLoading}
                  />
                </Field>
              </div>
              <Field label="Phone *">
                <input
                  type="text"
                  placeholder="+92 300 0000000"
                  value={form.phone || ""}
                  onChange={(e) => f("phone", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
              <Field label="Guests">
                <input
                  type="number"
                  placeholder="250"
                  value={form.guests || ""}
                  onChange={(e) => f("guests", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarDays size={12} /> Event Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Event Type", key: "event", options: EVENTS },
                { label: "Venue", key: "venue", options: VENUES },
                { label: "Time Slot", key: "timeSlot", options: TIME_SLOTS },
                { label: "Status", key: "status", options: STATUSES },
              ].map((fi) => (
                <Field key={fi.key} label={fi.label}>
                  <div className="relative">
                    <select
                      value={form[fi.key] || fi.options[0]}
                      onChange={(e) => f(fi.key, e.target.value)}
                      className={selectCls}
                      disabled={isLoading}
                    >
                      {fi.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none"
                    />
                  </div>
                </Field>
              ))}
              <div className="col-span-2">
                <Field label="Event Date *">
                  <input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) => f("date", e.target.value)}
                    className={inputCls}
                    disabled={isLoading}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CreditCard size={12} /> Payment Details
            </p>

            <div className="mb-4">
              <Field label="Total Amount (PKR)">
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={form.totalAmount || ""}
                  onChange={(e) => f("totalAmount", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
            </div>

            <div className="border border-green-200 rounded-2xl overflow-hidden bg-green-50/40">
              <div className="px-4 py-3 border-b border-green-100 flex items-center justify-between bg-green-50">
                <span className="text-xs font-semibold text-green-700">
                  Money received — add each payment separately
                </span>
                <button
                  type="button"
                  onClick={addPayment}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-300 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} /> Add payment
                </button>
              </div>

              {payments.length === 0 ? (
                <p className="text-xs text-green-500 text-center py-8 px-4">
                  No payments yet. Example: 30,000 Cash + 20,000 JazzCash → add two lines.
                </p>
              ) : (
                <div className="divide-y divide-green-100">
                  {payments.map((row, idx) => (
                    <div key={row.id} className="p-4 space-y-3 bg-white/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-600">
                          Payment {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePayment(row.id)}
                          disabled={isLoading}
                          className="text-green-300 hover:text-red-500 p-1 cursor-pointer border-none bg-transparent"
                          aria-label="Remove payment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Amount (PKR)">
                          <input
                            type="number"
                            placeholder="e.g. 30000"
                            value={row.amount}
                            onChange={(e) =>
                              updatePayment(row.id, "amount", e.target.value)
                            }
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                        <Field label="Method">
                          <div className="relative">
                            <select
                              value={row.method || "Cash"}
                              onChange={(e) =>
                                updatePayment(row.id, "method", e.target.value)
                              }
                              className={selectCls}
                              disabled={isLoading}
                            >
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none"
                            />
                          </div>
                        </Field>
                      </div>

                      {isBankMethod(row.method) && (
                        <Field label="Bank / wallet note (optional)">
                          <input
                            type="text"
                            placeholder="Account name or reference"
                            value={row.bankName || ""}
                            onChange={(e) =>
                              updatePayment(row.id, "bankName", e.target.value)
                            }
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Date">
                          <input
                            type="date"
                            value={row.date || ""}
                            onChange={(e) =>
                              updatePayment(row.id, "date", e.target.value)
                            }
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                        <Field label="Note (optional)">
                          <input
                            type="text"
                            placeholder="e.g. Token"
                            value={row.note || ""}
                            onChange={(e) =>
                              updatePayment(row.id, "note", e.target.value)
                            }
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                      </div>

                      <p className="text-[11px] text-green-500">
                        Method:{" "}
                        <span className="font-semibold text-green-800">{row.method}</span>
                        {Number(row.amount) > 0 ? ` · ${formatPKR(row.amount)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalAmount > 0 && (
              <div className="mt-4 bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="flex justify-between text-xs font-semibold text-green-700 mb-1">
                  <span>Total: {formatPKR(totalAmount)}</span>
                  <span className={remaining > 0 ? "text-red-400" : "text-green-700"}>
                    Remaining: {formatPKR(remaining)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-green-600 mb-2">
                  <span>Paid: {formatPKR(paidTotal)}</span>
                  <span className="font-bold">{pct}% paid</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {form.status === "Finished" && (
                  <p className="text-[11px] text-green-600 mt-1.5 font-medium">
                    Status Finished — marked 100% paid
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <Field label="Advance Due Date">
                <input
                  type="date"
                  value={form.advanceDueDate || ""}
                  onChange={(e) => f("advanceDueDate", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} /> Add-ons
              </p>
              <button
                type="button"
                onClick={() => setShowAddonPopup(true)}
                disabled={isNew || !booking?.id || isLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PlusCircle size={13} /> Add
              </button>
            </div>

            {!booking?.id ? (
              <div className="text-xs text-green-500 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                Save this booking first — add-ons are linked to a specific booking and can be
                added once it&apos;s created.
              </div>
            ) : addonRows.length > 0 ? (
              <div className="border border-green-100 rounded-xl p-3 bg-green-50/30 divide-y divide-stone-100">
                {addonRows.map((row) => (
                  <AddonRow
                    key={row.id}
                    addon={row}
                    onDelete={removeAddonRow}
                    onUpdate={handleUpdateAddon}
                    onMarkReceived={handleMarkReceived}
                    ADDON_CATEGORIES={ADDON_SERVICES}
                    ADDON_PAYMENT_METHODS={PAYMENT_METHODS}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-400 text-center py-3">No add-ons yet</p>
            )}
          </section>

          {showAddonPopup && (
            <AddonPopup
              draft={addonDraft}
              setDraft={setAddonDraft}
              onSubmit={submitAddon}
              onClose={() => setShowAddonPopup(false)}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="flex gap-3 px-8 pb-7">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-green-200 text-green-600 text-sm font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors cursor-pointer bg-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader size={15} className="animate-spin" />
            ) : isNew ? (
              <PlusCircle size={15} />
            ) : (
              <Save size={15} />
            )}
            {isLoading ? "Saving..." : isNew ? "Save Booking" : "Update Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}