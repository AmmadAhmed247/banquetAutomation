import React, { useState } from 'react';
import { TrendingUp, Trash2, Pencil, X, Calendar, RotateCcw } from "lucide-react";
import { currency, daysUntil } from "./ManagementUtils";

export function KpiCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 transition-colors hover:border-green-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">{label}</span>
        <Icon size={15} className="text-green-600 shrink-0" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-[12px] text-stone-500 truncate">{sub}</p>
          {trend !== undefined && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-0.5 shrink-0 ${trend >= 0 ? "border-green-200 bg-green-50 text-green-700" : "border-rose-200 bg-rose-50 text-rose-600"}`}>
              <TrendingUp size={11} className={trend < 0 ? "rotate-180" : ""} />{Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExpenseRow({ expense, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0 group gap-3">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-medium text-stone-800 truncate">{expense.label}</span>
        <span className="text-[11px] text-stone-500 mt-0.5 truncate">{expense.category}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[13px] text-stone-900 font-medium">{currency(expense.amount)}</span>
        <button onClick={() => onDelete(expense.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-stone-400 hover:text-green-700 rounded-md hover:bg-green-50">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function AddonRow({ addon, onDelete, onUpdate, onMarkReceived, ADDON_CATEGORIES = [], ADDON_PAYMENT_METHODS = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ service: addon.service, description: addon.description, client_price: addon.client_price, vendor_cost: addon.vendor_cost });
  const [receivedOpen, setReceivedOpen] = useState(false);
  
  const rawCategories = ADDON_CATEGORIES.length > 0 ? ADDON_CATEGORIES : ["Pepsi Co.", "Coca Cola Co.", "Fresh Flower", "Cola Next", "Dance Floor", "Water Bottles", "Ayaz Tissue", "Stage", "Fire Crackers", "Ladies Staff", "Miscellaneous" , "BBQ" , "Sound System", "Entry" , "Decoration"];
  const categories = rawCategories.map(c => typeof c === 'object' ? (c.name || c.value || String(c)) : String(c));

  const rawMethods = ADDON_PAYMENT_METHODS.length > 0 ? ADDON_PAYMENT_METHODS : ["Cash", "JazzCash", "EasyPaisa", "Habib Metro Usman", "Meezan Bank Sadar"];
  const paymentMethods = rawMethods.map(m => typeof m === 'object' ? (m.name || m.value || String(m)) : String(m));
  
  const [method, setMethod] = useState(paymentMethods[0]);

  const save = () => { onUpdate(addon.id, { ...draft, client_price: Number(draft.client_price), vendor_cost: Number(draft.vendor_cost) }); setIsEditing(false); };
  const commission = Number(addon.client_price || 0) - Number(addon.vendor_cost || 0);

  if (isEditing) return (
    <div className="border border-green-200 rounded-lg p-3 bg-green-50/40 mb-2 space-y-2">
      <select 
        value={draft.service} 
        onChange={(e) => setDraft({ ...draft, service: e.target.value })} 
        className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md text-[12px] outline-none focus:border-green-400 bg-white cursor-pointer"
        style={{ appearance: 'auto' }}
      >
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md text-[12px] outline-none focus:border-green-400 bg-white" />
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" value={draft.client_price} onChange={(e) => setDraft({ ...draft, client_price: e.target.value })} placeholder="Client Price" className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md text-[12px] outline-none focus:border-green-400 bg-white" />
        <input type="number" value={draft.vendor_cost} onChange={(e) => setDraft({ ...draft, vendor_cost: e.target.value })} placeholder="Vendor Cost" className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md text-[12px] outline-none focus:border-green-400 bg-white" />
      </div>
      <div className="flex gap-1.5 pt-0.5">
        <button onClick={save} className="flex-1 py-1.5 bg-green-600 text-white text-[12px] font-medium rounded-md hover:bg-green-700 transition-colors">Save</button>
        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-md hover:bg-stone-50 transition-colors">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="py-3 border-b border-stone-100 last:border-0 space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-stone-800 truncate min-w-0 flex-1">{addon.service}</p>
        <span className="text-[13px] font-bold text-stone-900 shrink-0">{currency(addon.client_price)}</span>
      </div>

      {addon.description && (
        <p className="text-[11px] text-stone-500 truncate">{addon.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <p className="text-[11px] text-stone-500 truncate min-w-0">
          Commission <span className="text-green-700 font-semibold">{currency(commission)}</span>
        </p>

        <div className="flex items-center gap-1.5 shrink-0">
          {addon.received ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700">Received</span>
              <button 
                onClick={() => onMarkReceived(addon.id, { received: false })} 
                title="Undo Received Status"
                className="text-stone-400 hover:text-amber-600 p-1 rounded-md hover:bg-amber-50 transition-colors"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          ) : receivedOpen ? (
            <div className="flex items-center gap-1 bg-white p-1 border border-stone-300 rounded-md shadow-sm">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)} 
                className="text-[11px] border border-stone-200 rounded px-2 py-1 outline-none bg-white text-stone-900 font-medium min-w-[110px] cursor-pointer"
                style={{ appearance: 'auto' }}
              >
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button 
                onClick={() => { onMarkReceived(addon.id, { received: true, payment_method: method }); setReceivedOpen(false); }} 
                className="text-[11px] font-semibold px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                ✓
              </button>
              <button 
                onClick={() => setReceivedOpen(false)} 
                className="text-[11px] px-1.5 py-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button onClick={() => setReceivedOpen(true)} className="text-[10px] font-medium px-2 py-0.5 rounded border border-stone-200 text-stone-500 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors">Mark Received</button>
          )}

          <button onClick={() => setIsEditing(true)} className="text-stone-400 hover:text-green-700 p-1 rounded-md hover:bg-green-50 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => onDelete(addon.id)} className="text-stone-400 hover:text-green-700 p-1 rounded-md hover:bg-green-50 transition-colors"><X size={13} /></button>
        </div>
      </div>
    </div>
  );
}

export function EventRow({ booking }) {
  const d = daysUntil(booking.date);
  const status = d < 0 ? { label: "Past", cls: "border-stone-200 bg-stone-50 text-stone-500" } : d === 0 ? { label: "Today", cls: "border-amber-200 bg-amber-50 text-amber-700" } : d <= 7 ? { label: "This week", cls: "border-green-200 bg-green-50 text-green-700" } : { label: "Upcoming", cls: "border-stone-200 bg-stone-50 text-stone-500" };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-8 h-8 rounded-md border border-stone-200 flex items-center justify-center shrink-0">
        <Calendar size={14} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-stone-800 truncate">{booking.client}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${status.cls}`}>{status.label}</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-0.5 truncate">{booking.hall} · {booking.event}</p>
      </div>
      <span className="text-[11px] text-stone-500 shrink-0">{new Date(booking.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short" })}</span>
    </div>
  );
}