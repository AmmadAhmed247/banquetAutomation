import { useState, useEffect } from "react";
import {
  CalendarDays, Users,
  PlusCircle, X, CreditCard, ChevronDown, Loader, Save, Pencil, Trash2, Plus,
} from "lucide-react";
import { useAllAddons, useCreateAddon, useDeleteAddon, useUpdateAddon } from "../lib/hooks/addon.hook";
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
  const savedSettlementMethod =
    booking.settlementPaymentMethod ??
    booking.settlement_payment_method ??
    booking.payment_method ??
    "Cash";
  const savedSettlementBank =
    booking.settlementBankName ??
    booking.settlement_bank_name ??
    (PAYMENT_METHODS.includes(savedSettlementMethod) &&
    !["Cash", "JazzCash", "EasyPaisa"].includes(savedSettlementMethod)
      ? savedSettlementMethod
      : "");

  return {
    ...booking,
    totalAmount: booking.baseAmount ?? booking.totalAmount ?? booking.total_amount ?? "",
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
      ["Cash", "JazzCash", "EasyPaisa"].includes(savedSettlementMethod)
        ? savedSettlementMethod
        : "Bank Transfer",
    settlementBankName: savedSettlementBank,
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

function SectionTitle({ icon: Icon, children }) {
  return (
    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
      <Icon size={12} /> {children}
    </p>
  );
}

function SelectBox({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={selectCls}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none"
      />
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
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-green-950/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-green-100 p-2 rounded-xl">
              <CreditCard size={16} className="text-green-600" />
            </div>
            <h3 className="text-[15px] font-bold text-green-900">Add-on</h3>
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
            <SelectBox value={draft.service} onChange={set("service")} disabled={isLoading}>
              <option value="" disabled>
                Select
              </option>
              {ADDON_SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SelectBox>
          </Field>

          <Field label="Notes">
            <input
              type="text"
              value={draft.description}
              onChange={set("description")}
              className={inputCls}
              disabled={isLoading}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Client Price">
              <input
                type="number"
                value={draft.client_price}
                onChange={set("client_price")}
                className={inputCls}
                disabled={isLoading}
              />
            </Field>
            <Field label="Vendor Cost">
              <input
                type="number"
                value={draft.vendor_cost}
                onChange={set("vendor_cost")}
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
            Add
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

  const addonQueryResult = useAllAddons();
  const rawAddons =
    addonQueryResult?.data?.addons ?? addonQueryResult?.data ?? addonQueryResult ?? [];
  const allAddonsList = Array.isArray(rawAddons)
    ? rawAddons.map((a) => ({ ...a, id: a.id || a._id }))
    : [];

  const createAddon = useCreateAddon();
  const deleteAddon = useDeleteAddon();
  const updateAddon = useUpdateAddon();

  const addonRows =
    !isNew && booking?.id
      ? allAddonsList.filter((a) => (a.bookingId ?? a.booking_id) === booking.id)
      : [];

  useEffect(() => {
    setForm(normalizeBooking(booking));
  }, [booking]);

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const payments = Array.isArray(form.payments) ? form.payments : [];
  const advancePaidTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const addonTotal = addonRows.reduce((sum, addon) => sum + Number(addon.client_price || 0), 0);
  const totalAmount = Number(form.totalAmount || 0) + addonTotal;
  const settlementAmount = Math.max(0, totalAmount - advancePaidTotal);
  const paidTotal = form.status === "Finished" ? totalAmount : advancePaidTotal;
  const advanceAmount = Number(form.advanceAmount || 0);
  const advanceLeft = Math.max(0, advanceAmount - advancePaidTotal);
  const balanceDue = Math.max(0, totalAmount - paidTotal);
  const isFullyPaid = balanceDue <= 0;
  const pct = isFullyPaid
    ? 100
    : Math.min(100, Math.round((paidTotal / totalAmount) * 100));

  function addPayment() {
    setForm((p) => ({
      ...p,
      payments: [
        ...(p.payments || []),
        { id: makePaymentId(), amount: "", method: "Cash", bankName: "", note: "", date: todayString() },
      ],
    }));
  }

  function updatePayment(id, key, value) {
    setForm((p) => ({
      ...p,
      payments: (p.payments || []).map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      ),
    }));
  }

  function removePayment(id) {
    setForm((p) => ({
      ...p,
      payments: (p.payments || []).filter((row) => row.id !== id),
    }));
  }

  function chooseSettlementMethod(method) {
    const isBank = !["Cash", "JazzCash", "EasyPaisa"].includes(method);
    setForm((current) => ({
      ...current,
      settlementPaymentMethod: isBank ? "Bank Transfer" : method,
      settlementBankName: isBank ? method : "",
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
      totalAmount,
      payments: cleanPayments,
      advancePaid: paid,
      advanceAmount:
        form.advanceAmount !== "" && form.advanceAmount != null
          ? Number(form.advanceAmount)
          : paid,
      paymentMethod: primary?.method || form.paymentMethod || "Cash",
      bankName: primary?.bankName || form.bankName || "",
      paymentNote: primary?.note || form.paymentNote || "",
    });
  }

  function handleSettle() {
    if (form.status === "Finished") handleSave();
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
              {!isNew && booking?.client && (
                <p className="text-xs text-green-400">{booking.client}</p>
              )}
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
            <SectionTitle icon={Users}>Client</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="R. No.">
                <input
                  type="text"
                  value={form.rNo || ""}
                  onChange={(e) => f("rNo", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
              <Field label="Guests">
                <input
                  type="number"
                  value={form.guests || ""}
                  onChange={(e) => f("guests", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
              <Field label="Name *">
                <input
                  type="text"
                  value={form.client || ""}
                  onChange={(e) => f("client", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
              <Field label="Phone *">
                <input
                  type="text"
                  placeholder="+92"
                  value={form.phone || ""}
                  onChange={(e) => f("phone", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle icon={CalendarDays}>Event</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Type", key: "event", options: EVENTS },
                { label: "Venue", key: "venue", options: VENUES },
                { label: "Time", key: "timeSlot", options: TIME_SLOTS },
                { label: "Status", key: "status", options: STATUSES },
              ].map((fi) => (
                <Field key={fi.key} label={fi.label}>
                  <SelectBox
                    value={form[fi.key] || fi.options[0]}
                    onChange={(e) => f(fi.key, e.target.value)}
                    disabled={isLoading}
                  >
                    {fi.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </SelectBox>
                </Field>
              ))}
              <div className="col-span-2">
                <Field label="Date *">
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
            <SectionTitle icon={CreditCard}>Payment</SectionTitle>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Total (PKR)">
                <input
                  type="number"
                  value={totalAmount || ""}
                  onChange={(e) => f("totalAmount", Math.max(0, Number(e.target.value || 0) - addonTotal))}
                  className={inputCls}
                  disabled={isLoading}
                />
                <span className="text-[10px] text-green-500">Includes booking and add-on amounts</span>
              </Field>
              <Field label="Advance (PKR)">
                <input
                  type="number"
                  value={form.advanceAmount || ""}
                  onChange={(e) => f("advanceAmount", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
              <Field label="Advance Due">
                <input
                  type="date"
                  value={form.advanceDueDate || ""}
                  onChange={(e) => f("advanceDueDate", e.target.value)}
                  className={inputCls}
                  disabled={isLoading}
                />
              </Field>
            </div>

            <div className="border border-green-200 rounded-2xl overflow-hidden bg-green-50/40">
              <div className="px-4 py-3 border-b border-green-100 flex items-center justify-between bg-green-50">
                <span className="text-xs font-semibold text-green-700">Payments received</span>
                <button
                  type="button"
                  onClick={addPayment}
                  disabled={isLoading }
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-300 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              {payments.length === 0 ? (
                <p className="text-xs text-green-500 text-center py-6 px-4">No payments yet</p>
              ) : (
                <div className="divide-y divide-green-100">
                  {payments.map((row) => (
                    <div key={row.id} className="p-4 bg-white/80 flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Field label="Amount">
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => updatePayment(row.id, "amount", e.target.value)}
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                        <Field label="Method">
                          <SelectBox
                            value={row.method || "Cash"}
                            onChange={(e) => updatePayment(row.id, "method", e.target.value)}
                            disabled={isLoading}
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </SelectBox>
                        </Field>
                        <Field label="Date">
                          <input
                            type="date"
                            value={row.date || ""}
                            onChange={(e) => updatePayment(row.id, "date", e.target.value)}
                            className={inputCls}
                            disabled={isLoading}
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePayment(row.id)}
                        disabled={isLoading}
                        className="text-green-300 hover:text-red-500 p-2 mb-0.5 cursor-pointer border-none bg-transparent"
                        aria-label="Remove payment"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {form.status === "Finished" && (
              <div className="mt-4 border border-green-200 bg-green-50 rounded-2xl p-4">
                <p className="text-sm font-bold text-green-900">
                  Settle {formatPKR(settlementAmount)}
                </p>
                <p className="text-xs text-green-700 mt-1 mb-3">
                  Choose how the remaining amount was received. Saving again updates this settlement instead of adding another one.
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const selected =
                      method === "Cash" ||
                      method === "JazzCash" ||
                      method === "EasyPaisa"
                        ? form.settlementPaymentMethod === method
                        : form.settlementPaymentMethod === "Bank Transfer" &&
                          form.settlementBankName === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => chooseSettlementMethod(method)}
                        disabled={isLoading}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50 ${
                          selected
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-green-300 bg-white text-green-800 hover:bg-green-100"
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleSettle}
                  disabled={isLoading}
                  className="mt-3 w-full px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-50"
                >
                  Settle with{" "}
                  {form.settlementPaymentMethod === "Bank Transfer"
                    ? form.settlementBankName || "Bank Transfer"
                    : form.settlementPaymentMethod || "Cash"}
                </button>
              </div>
            )}

            {(totalAmount > 0 || advanceAmount > 0 || paidTotal > 0) && (
              <div className="mt-4 bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="grid grid-cols-4 gap-2 text-xs text-green-600 mb-3">
                  <div>
                    <p>Total</p>
                    <p className="text-sm font-bold text-green-800">{formatPKR(totalAmount)}</p>
                  </div>
                  <div>
                    <p>Paid ({pct}%)</p>
                    <p className="text-sm font-bold text-green-800">{formatPKR(paidTotal)}</p>
                  </div>
                  <div>
                    <p>Advance left</p>
                    <p
                      className={`text-sm font-bold ${
                        advanceLeft > 0 ? "text-amber-600" : "text-green-800"
                      }`}
                    >
                      {advanceAmount > 0 ? formatPKR(advanceLeft) : "—"}
                    </p>
                  </div>
                  <div>
                    <p>Remaining</p>
                    <p
                      className={`text-sm font-bold ${
                        balanceDue > 0 ? "text-red-400" : "text-green-800"
                      }`}
                    >
                      {formatPKR(balanceDue)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle icon={CreditCard}>Add-ons</SectionTitle>
              <button
                type="button"
                onClick={() => setShowAddonPopup(true)}
                disabled={isNew || !booking?.id || isLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-200 rounded-lg px-3 py-1.5 mb-3 hover:bg-green-50 cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PlusCircle size={13} /> Add
              </button>
            </div>

            {!booking?.id ? (
              <div className="text-xs text-green-500 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                Save the booking to add add-ons.
              </div>
            ) : addonRows.length > 0 ? (
              <div className="border border-green-100 rounded-xl p-3 bg-green-50/30 divide-y divide-stone-100">
                {addonRows.map((row) => (
                  <AddonRow
                    key={row.id}
                    addon={row}
                    onDelete={removeAddonRow}
                    onUpdate={handleUpdateAddon}
                    ADDON_CATEGORIES={ADDON_SERVICES}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-400 text-center py-3">No add-ons</p>
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
            {isLoading ? "Saving..." : isNew ? "Save Booking" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}