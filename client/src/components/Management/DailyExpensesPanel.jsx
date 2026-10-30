import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DAILY_EXPENSE_CATEGORIES, currency } from "./ManagementUtils.js";

const QUANTITY_CATEGORIES = ["Pepsi Co.", "Coca Cola Co.", "Diesel", "Water Bottles"];

// Brands list specifically for when "JUMBO" is selected
const JUMBO_BRANDS = ["Pepsi", "Coca Cola", "Fanta", "Dew", "Sprite", "Other"];

function isTodayPKT(dateInput) {
  if (!dateInput) return false;
  const todayPKT = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  const recordPKT = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date(dateInput));
  return todayPKT === recordPKT;
}

// Builds a brand-new, empty form state (used on open, save and cancel)
const getFreshDaily = () => {
  const defaultCat = DAILY_EXPENSE_CATEGORIES[0];
  return {
    // today's date in PKT, formatted YYYY-MM-DD for the date input
    date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date()),
    category: defaultCat,
    subCategory: defaultCat === "JUMBO" ? JUMBO_BRANDS[0] : "",
    label: "",
    amount: "",
  };
};

export function DailyExpensesPanel({
  allDailyExpenses,
  addingDaily,
  setAddingDaily,
  newDaily,
  setNewDaily,
  createDailyExpenseMutation,
  deleteDailyExpenseMutation,
}) {
  const [showAll, setShowAll] = useState(false);

  const visible = allDailyExpenses.filter(de => isTodayPKT(de.date));
  const displayed = showAll ? visible : visible.slice(0, 5);

  // Check if it's a standard quantity category or JUMBO
  const isJumbo = newDaily.category === "JUMBO";
  const isQuantityCategory = QUANTITY_CATEGORIES.includes(newDaily.category) || isJumbo;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-bold text-stone-900">Daily Expenses</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Petty cash and small spends (today)</p>
        </div>
        {!addingDaily && (
          <button
            onClick={() => {
              setNewDaily(getFreshDaily());
              setAddingDaily(true);
            }}
            className="text-[11px] font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      <div className="space-y-2 mb-2">
        {visible.length === 0 ? (
          <p className="text-[11px] text-stone-400 text-center py-4">No expenses recorded today.</p>
        ) : (
          displayed.map(de => (
            <div key={de.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-100 group">
              <div>
                <p className="text-[12px] font-semibold text-stone-800">{de.label}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {de.category} {de.subCategory ? `(${de.subCategory})` : ""} • {new Date(de.date).toLocaleDateString('en-US', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-stone-800">{currency(de.amount)}</span>
                <button onClick={() => deleteDailyExpenseMutation.mutate(de.id)} className="text-rose-500 hover:text-rose-800 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {visible.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 py-1.5 mb-2 transition-colors"
        >
          {showAll ? "Show less" : `Show ${visible.length - 5} more`}
        </button>
      )}

      {addingDaily && (
        <div className="flex flex-col gap-2 pt-3 border-t border-stone-100">
          <input
            type="date"
            value={newDaily.date}
            onChange={(e) => setNewDaily({ ...newDaily, date: e.target.value })}
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
          />

          {/* Main Category Dropdown */}
          <select
            value={newDaily.category}
            onChange={(e) => {
              const category = e.target.value;
              setNewDaily({
                ...newDaily,
                category,
                subCategory: category === "JUMBO" ? JUMBO_BRANDS[0] : "",
                label: ""
              });
            }}
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white"
          >
            {DAILY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Sub-Category / Brand Dropdown (Appears only when JUMBO is selected) */}
          {isJumbo && (
            <select
              value={newDaily.subCategory || JUMBO_BRANDS[0]}
              onChange={(e) => setNewDaily({ ...newDaily, subCategory: e.target.value })}
              className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white"
            >
              {JUMBO_BRANDS.map((brand) => <option key={brand}>{brand}</option>)}
            </select>
          )}

          {/* Quantity or standard label input */}
          {isQuantityCategory ? (
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={newDaily.label}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setNewDaily({ ...newDaily, label: val });
                }
              }}
              placeholder="Quantity"
              className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
            />
          ) : (
            <input
              value={newDaily.label}
              onChange={(e) => setNewDaily({ ...newDaily, label: e.target.value })}
              placeholder="Label"
              className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
            />
          )}

          <input
            type="number"
            value={newDaily.amount}
            onChange={(e) => setNewDaily({ ...newDaily, amount: e.target.value })}
            placeholder="Amount"
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                createDailyExpenseMutation.mutate({
                  ...newDaily,
                  amount: Number(newDaily.amount),
                });
                setNewDaily(getFreshDaily());
                setAddingDaily(false);
              }}
              className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNewDaily(getFreshDaily());
                setAddingDaily(false);
              }}
              className="px-3 py-1.5 bg-white text-stone-500 border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}