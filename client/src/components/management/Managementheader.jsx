import { ChevronDown } from "lucide-react";
import { MONTHS, YEARS } from "./ManagementUtils";

export function ManagementHeader({ hallFilter, setHallFilter, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200/80">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">Management Suite</span>
        <h1 className="text-[26px] font-bold tracking-tight text-stone-900 mt-1.5">Expense & Profit Ledger</h1>
      </div>
      <div className="flex flex-wrap gap-2.5 items-center">
        <div className="bg-white p-1 rounded-xl flex gap-0.5 border border-stone-200 shadow-sm">
          {["all", "Hall A", "Hall B"].map(h => (
            <button
              key={h}
              onClick={() => setHallFilter(h)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${hallFilter === h ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
            >
              {h === "all" ? "Both Halls" : h}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-[12px] font-semibold text-stone-700 outline-none cursor-pointer shadow-sm"
          >
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        </div>
        <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
          <button
            onClick={() => setSelectedMonth(null)}
            className={`shrink-0 px-3.5 py-2 rounded-xl border text-[11px] font-semibold transition-all ${selectedMonth === null ? "bg-stone-900 text-white border-stone-900 shadow-sm" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}
          >
            All Months
          </button>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(i)}
              className={`shrink-0 px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-all ${selectedMonth === i ? "bg-stone-900 text-white border-stone-900 shadow-sm" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}