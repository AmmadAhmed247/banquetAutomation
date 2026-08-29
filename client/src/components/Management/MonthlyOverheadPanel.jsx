import { Trash2 } from "lucide-react";
import { MONTHS, YEARS, MONTHLY_EXPENSE_CATEGORIES, currency } from "./ManagementUtils.js";

export function MonthlyOverheadPanel({
  allMonthlyExpenses,
  selectedYear,
  selectedMonth,
  addingMonthly,
  setAddingMonthly,
  newMonthly,
  setNewMonthly,
  createMonthlyExpenseMutation,
  deleteMonthlyExpenseMutation,
}) {
  const visible = allMonthlyExpenses.filter(
    me => me.year === selectedYear && (selectedMonth === null || (me.month - 1) === selectedMonth)
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-bold text-stone-900">Monthly Overhead</p>
        {!addingMonthly && (
          <button onClick={() => setAddingMonthly(true)} className="text-[11px] font-semibold px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors">
            + Add
          </button>
        )}
      </div>
      <div className="space-y-2 mb-2">
        {visible.map(me => (
          <div key={me.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-100 group">
            <div>
              <p className="text-[12px] font-semibold text-stone-800">{me.label}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{me.category} • {MONTHS[me.month - 1]}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-stone-800">{currency(me.amount)}</span>
              <button onClick={() => deleteMonthlyExpenseMutation.mutate(me.id)} className=" text-rose-500 hover:text-rose-800 transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {addingMonthly && (
        <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
          <div className="grid grid-cols-2 gap-2">
            <select value={newMonthly.month} onChange={(e) => setNewMonthly({ ...newMonthly, month: Number(e.target.value) })} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none">
              {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
            </select>
            <select value={newMonthly.year} onChange={(e) => setNewMonthly({ ...newMonthly, year: Number(e.target.value) })} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <select value={newMonthly.category} onChange={e => setNewMonthly({ ...newMonthly, category: e.target.value })} className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none">
            {MONTHLY_EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={newMonthly.label} onChange={e => setNewMonthly({ ...newMonthly, label: e.target.value })} placeholder="Label" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
          <input type="number" value={newMonthly.amount} onChange={e => setNewMonthly({ ...newMonthly, amount: e.target.value })} placeholder="Amount" className="px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
          <div className="flex gap-2">
            <button
              onClick={() => { createMonthlyExpenseMutation.mutate({ ...newMonthly, amount: Number(newMonthly.amount) }); setAddingMonthly(false); }}
              className="flex-1 py-1.5 bg-amber-600 text-white text-[12px] font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Save
            </button>
            <button onClick={() => setAddingMonthly(false)} className="px-3 py-1.5 bg-white border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}