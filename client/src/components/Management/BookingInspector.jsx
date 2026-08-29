import React, { useState, useEffect } from "react";
import { Receipt, X, Plus, FileText, Check, Pencil } from "lucide-react";
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
  onUpdateMenuNote, // Callback to save notes to backend
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Sync local note text whenever selected booking changes
  useEffect(() => {
    setNoteText(selectedBooking?.menu_note || "");
    setIsEditingNote(false);
  }, [selectedBookingId, selectedBooking?.menu_note]);

  const handleSaveNote = () => {
    if (onUpdateMenuNote && selectedBookingId) {
      onUpdateMenuNote(selectedBookingId, noteText);
    }
    setIsEditingNote(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
      {!selectedBookingId ? (
        <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-3">
            <Receipt size={16} className="text-stone-400" />
          </div>
          <p className="text-[13px] font-semibold text-stone-700">No booking selected</p>
          <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">Select a row to inspect its costs and notes.</p>
        </div>
      ) : (
        <>
          {/* Header & Financial Totals */}
          <div className="p-5 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 text-stone-600">
                  {selectedBooking?.hall}
                </span>
                <p className="text-[14px] font-bold text-stone-900 mt-1.5">{selectedBooking?.client}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {selectedBooking?.event} · {selectedBooking?.date ? new Date(selectedBooking.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" }) : ""}
                </p>
              </div>
              <button 
                onClick={() => setSelectedBookingId(null)} 
                className="text-stone-400 hover:text-stone-900 p-1 rounded-lg hover:bg-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { label: "Gross Rev", value: currency(selGrossRev), cls: "text-stone-800" },
                { label: "Total Costs", value: currency(selGrossExp), cls: "text-rose-600" },
                { label: "Net Profit", value: currency(selGrossRev - selGrossExp), cls: selGrossRev - selGrossExp >= 0 ? "text-emerald-700" : "text-rose-600" },
                { label: "Comm.", value: currency(selAddons.reduce((s, a) => a.received ? s + (Number(a.client_price) - Number(a.vendor_cost)) : s, 0)), cls: "text-violet-700" },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl p-2.5 border border-stone-100 shadow-sm">
                  <p className="text-[9px] text-stone-400 uppercase tracking-wide mb-1 font-semibold">{k.label}</p>
                  <p className={`text-[12px] font-bold ${k.cls}`}>{k.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Lists & Notes Area */}
          <div className="flex-1 overflow-y-auto px-5 py-3 max-h-[380px] space-y-4">
            
            {/* Menu & Setup Note Section */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <FileText size={12} /> Menu & Setup Note
                </span>
                {!isEditingNote ? (
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className="text-[11px] font-medium text-emerald-700 hover:underline flex items-center gap-0.5"
                  >
                    <Pencil size={11} /> {selectedBooking?.menu_note ? "Edit" : "Add Note"}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="text-[11px] font-medium text-stone-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Specify dishes, setup style, stage decoration..."
                    className="w-full px-2.5 py-1.5 border border-emerald-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white text-stone-900 resize-none"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <Check size={12} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-stone-700 whitespace-pre-wrap">
                  {selectedBooking?.menu_note || <span className="text-stone-400 italic">No notes added yet.</span>}
                </p>
              )}
            </div>

            {/* Standard Expenses Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 pb-1.5 border-b border-stone-100">Standard Expenses</p>
              {selExp.length === 0 ? (
                <p className="text-[12px] text-stone-400 text-center py-3">No costs logged.</p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {selExp.map(e => (
                    <ExpenseRow 
                      key={e.id} 
                      expense={e} 
                      onDelete={id => deleteExpenseMutation.mutate(id)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add-on Services Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 pb-1.5 border-b border-stone-100">Add-on Services</p>
              {selAddons.length === 0 ? (
                <p className="text-[12px] text-stone-400 text-center py-3">No add-ons logged.</p>
              ) : (
                <div className="divide-y divide-stone-50">
                  {selAddons.map(a => (
                    <AddonRow
                      key={a.id}
                      addon={a}
                      onDelete={id => deleteAddonMutation.mutate(id)}
                      onUpdate={(id, data) => updateAddonMutation.mutate({ id, data })}
                      onMarkReceived={handleMarkReceived}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action / Form Section */}
          <div className="border-t border-stone-100 p-4 bg-stone-50/40">
            {addingTo === selectedBookingId ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between bg-stone-200/70 p-1 rounded-xl">
                  <button 
                    onClick={() => setMode("expense")} 
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${mode === "expense" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
                  >
                    Standard
                  </button>
                  <button 
                    onClick={() => setMode("addon")} 
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${mode === "addon" ? "bg-violet-600 text-white shadow-sm" : "text-stone-500"}`}
                  >
                    Add-on
                  </button>
                </div>

                {mode === "expense" ? (
                  <div className="space-y-2">
                    <select 
                      value={newExp.category} 
                      onChange={e => setNewExp({ ...newExp, category: e.target.value })} 
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white"
                    >
                      {STANDARD_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                      value={newExp.label} 
                      onChange={e => setNewExp({ ...newExp, label: e.target.value })} 
                      placeholder="Description" 
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white" 
                    />
                    <input 
                      type="number" 
                      value={newExp.amount} 
                      onChange={e => setNewExp({ ...newExp, amount: e.target.value })} 
                      placeholder="Amount" 
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white" 
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          createExpenseMutation.mutate({ bookingId: selectedBookingId, ...newExp, amount: Number(newExp.amount) });
                          setNewExp({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
                          setAddingTo(null);
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Add Expense
                      </button>
                      <button 
                        onClick={() => setAddingTo(null)} 
                        className="px-3 py-1.5 bg-white border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors text-stone-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select 
                      value={newAddon.service} 
                      onChange={e => setNewAddon({ ...newAddon, service: e.target.value })} 
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 bg-white"
                    >
                      {ADDON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                      value={newAddon.description} 
                      onChange={e => setNewAddon({ ...newAddon, description: e.target.value })} 
                      placeholder="Notes / Description" 
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white" 
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        value={newAddon.client_price} 
                        onChange={e => setNewAddon({ ...newAddon, client_price: e.target.value })} 
                        placeholder="Client Price" 
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] bg-white" 
                      />
                      <input 
                        type="number" 
                        value={newAddon.vendor_cost} 
                        onChange={e => setNewAddon({ ...newAddon, vendor_cost: e.target.value })} 
                        placeholder="Vendor Cost" 
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] bg-white" 
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          createAddonMutation.mutate({ bookingId: selectedBookingId, ...newAddon, client_price: Number(newAddon.client_price), vendor_cost: Number(newAddon.vendor_cost) });
                          setNewAddon({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "", description: "" });
                          setAddingTo(null);
                        }}
                        className="flex-1 py-1.5 bg-violet-600 text-white text-[12px] font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        Add Add-on
                      </button>
                      <button 
                        onClick={() => setAddingTo(null)} 
                        className="px-3 py-1.5 bg-white border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors text-stone-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
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