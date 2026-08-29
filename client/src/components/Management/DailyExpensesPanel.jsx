import { Trash2 } from "lucide-react";
import { DAILY_EXPENSE_CATEGORIES, currency } from "./ManagementUtils.js";

export function DailyExpensesPanel({
  allDailyExpenses,
  selectedYear,
  selectedMonth,
  addingDaily,
  setAddingDaily,
  newDaily,
  setNewDaily,
  createDailyExpenseMutation,
  deleteDailyExpenseMutation,
}) {
  const visible = allDailyExpenses.filter(de => {
    const d = new Date(de.date);
    return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth);
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-bold text-stone-900">Daily Expenses</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Petty cash and small spends</p>
        </div>
        {!addingDaily && (
          <button onClick={() => setAddingDaily(true)} className="text-[11px] font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
            + Add
          </button>
        )}
      </div>
      <div className="space-y-2 mb-2">
        {visible.map(de => (
          <div key={de.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-100 group">
            <div>
              <p className="text-[12px] font-semibold text-stone-800">{de.label}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{de.category} • {new Date(de.date).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-stone-800">{currency(de.amount)}</span>
              <button onClick={() => deleteDailyExpenseMutation.mutate(de.id)} className="text-rose-500 hover:text-rose-800 transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {addingDaily && (
        <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
          <input type="date" value={newDaily.date} onChange={(e) => setNewDaily({ ...newDaily, date: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
          <select value={newDaily.category} onChange={(e) => setNewDaily({ ...newDaily, category: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white">
            {DAILY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={newDaily.label} onChange={(e) => setNewDaily({ ...newDaily, label: e.target.value })} placeholder="Label" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
          <input type="number" value={newDaily.amount} onChange={(e) => setNewDaily({ ...newDaily, amount: e.target.value })} placeholder="Amount" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
          <div className="flex gap-2">
            <button
              onClick={() => { createDailyExpenseMutation.mutate({ ...newDaily, amount: Number(newDaily.amount) }); setAddingDaily(false); }}
              className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
            <button onClick={() => setAddingDaily(false)} className="px-3 py-1.5 bg-white text-stone-500 border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}