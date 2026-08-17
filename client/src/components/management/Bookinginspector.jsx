import { Receipt, X, Plus } from "lucide-react";
import { STANDARD_EXPENSE_CATEGORIES, ADDON_CATEGORIES, currency } from "./ManagementUtils";
import { ExpenseRow, AddonRow } from "./ManagementRows";

export function BookingInspector({
  selectedBookingId,
  setSelectedBookingId,
  selectedBooking,
  selAddons,
  selExp,
  selGrossRev,
  selGrossExp,
  deleteExpenseMutation,
  deleteAddonMutation,
  updateAddonMutation,
  handleMarkReceived,
  addingTo,
  setAddingTo,
  mode,
  setMode,
  newExp,
  setNewExp,
  newAddon,
  setNewAddon,
  createExpenseMutation,
  createAddonMutation,
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
      {!selectedBookingId ? (
        <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-3"><Receipt size={16} className="text-stone-400" /></div>
          <p className="text-[13px] font-semibold text-stone-700">No booking selected</p>
          <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">Select a row to inspect its costs.</p>
        </div>
      ) : (
        <>
          <div className="p-5 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 text-stone-600">{selectedBooking?.hall}</span>
                <p className="text-[14px] font-bold text-stone-900 mt-1.5">{selectedBooking?.client}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {selectedBooking?.event} · {new Date(selectedBooking?.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setSelectedBookingId(null)} className="text-stone-400 hover:text-stone-900 p-1 rounded-lg hover:bg-white transition-colors"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { label: "Gross Rev", value: currency(selGrossRev), cls: "text-stone-800" },
                { label: "Total Costs", value: currency(selGrossExp), cls: "text-rose-600" },
                { label: "Net Profit", value: currency(selGrossRev - selGrossExp), cls: selGrossRev - selGrossExp >= 0 ? "text-emerald-700" : "text-rose-600" },
                { label: "Comm.", value: currency(selAddons.reduce((s, a) => a.received ? s + (Number(a.client_price) - Number(a.vendor_cost)) : s, 0)), cls: "text-violet-700" },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl p-2.5 border border-stone-100">
                  <p className="text-[9px] text-stone-400 uppercase tracking-wide mb-1 font-semibold">{k.label}</p>
                  <p className={`text-[12px] font-bold ${k.cls}`}>{k.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2 max-h-72">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 pt-3 pb-1">Standard Expenses</p>
            {selExp.length === 0
              ? <p className="text-[12px] text-stone-400 text-center py-4">No costs logged.</p>
              : selExp.map(e => <ExpenseRow key={e.id} expense={e} onDelete={id => deleteExpenseMutation.mutate(id)} />)}

            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 pt-4 pb-1">Add-on Services</p>
            {selAddons.length === 0
              ? <p className="text-[12px] text-stone-400 text-center py-4">No add-ons logged.</p>
              : selAddons.map(a => (
                  <AddonRow
                    key={a.id}
                    addon={a}
                    onDelete={id => deleteAddonMutation.mutate(id)}
                    onUpdate={(id, data) => updateAddonMutation.mutate({ id, data })}
                    onMarkReceived={handleMarkReceived}
                  />
                ))}
          </div>

          <div className="border-t border-stone-100 p-4 bg-stone-50/40">
            {addingTo === selectedBookingId ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-stone-100 p-1 rounded-xl">
                  <button onClick={() => setMode("expense")} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${mode === "expense" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Standard</button>
                  <button onClick={() => setMode("addon")} className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${mode === "addon" ? "bg-violet-600 text-white shadow-sm" : "text-stone-500"}`}>Add-on</button>
                </div>

                {mode === "expense" ? (
                  <>
                    <select value={newExp.category} onChange={e => setNewExp({ ...newExp, category: e.target.value })} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white">
                      {STANDARD_EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input value={newExp.label} onChange={e => setNewExp({ ...newExp, label: e.target.value })} placeholder="Description" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
                    <input type="number" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: e.target.value })} placeholder="Amount" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          createExpenseMutation.mutate({ bookingId: selectedBookingId, ...newExp, amount: Number(newExp.amount) });
                          setNewExp({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
                          setAddingTo(null);
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Add
                      </button>
                      <button onClick={() => setAddingTo(null)} className="px-3 py-1.5 bg-white border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <select value={newAddon.service} onChange={e => setNewAddon({ ...newAddon, service: e.target.value })} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 bg-white">
                      {ADDON_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input value={newAddon.description} onChange={e => setNewAddon({ ...newAddon, description: e.target.value })} placeholder="Notes" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={newAddon.client_price} onChange={e => setNewAddon({ ...newAddon, client_price: e.target.value })} placeholder="Client" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px]" />
                      <input type="number" value={newAddon.vendor_cost} onChange={e => setNewAddon({ ...newAddon, vendor_cost: e.target.value })} placeholder="Vendor" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px]" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          createAddonMutation.mutate({ bookingId: selectedBookingId, ...newAddon, client_price: Number(newAddon.client_price), vendor_cost: Number(newAddon.vendor_cost) });
                          setAddingTo(null);
                        }}
                        className="flex-1 py-1.5 bg-violet-600 text-white text-[12px] font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        Add Add-on
                      </button>
                      <button onClick={() => setAddingTo(null)} className="px-3 py-1.5 bg-white border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">Cancel</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(selectedBookingId)}
                className="w-full py-2.5 border border-dashed border-stone-300 rounded-xl text-[12px] font-semibold text-stone-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Add Line Cost / Add-on
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}