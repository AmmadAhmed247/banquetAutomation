import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Plus, Trash2, Receipt,
  ChevronDown, BarChart3, Calendar, DollarSign, Package,
  SlidersHorizontal, X, ArrowUpRight, Inbox
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EXPENSE_CATEGORIES = ["Catering","Decoration","Audio / Lights","Staff Wages","Cleaning","Maintenance","Utilities","Marketing","Miscellaneous"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function currency(n) {
  return "₨ " + Number(n || 0).toLocaleString("en-PK");
}
function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED_BOOKINGS = [
  { id: 1,  hall: "Hall A", client: "Rania & Omar",    event: "Wedding",    date: "2026-05-03", revenue: 275000 },
  { id: 2,  hall: "Hall B", client: "Sana & Bilal",    event: "Nikkah",     date: "2026-05-03", revenue: 120000 },
  { id: 3,  hall: "Hall A", client: "Fatima & Usman",  event: "Wedding",    date: "2026-05-14", revenue: 310000 },
  { id: 4,  hall: "Hall B", client: "Ayesha & Hassan", event: "Reception",  date: "2026-05-20", revenue: 180000 },
  { id: 5,  hall: "Hall A", client: "Zara & Khalid",   event: "Mehndi",     date: "2026-06-05", revenue: 145000 },
  { id: 6,  hall: "Hall B", client: "Sara & Ahmed",    event: "Wedding",    date: "2026-06-12", revenue: 290000 },
  { id: 7,  hall: "Hall A", client: "Hira & Faisal",   event: "Wedding",    date: "2026-06-19", revenue: 340000 },
  { id: 8,  hall: "Hall B", client: "Mariam & Tariq",  event: "Reception",  date: "2026-07-08", revenue: 160000 },
];

const SEED_EXPENSES = [
  { id: 1, bookingId: 1, category: "Catering",       label: "Dinner for 400 guests",   amount: 140000 },
  { id: 2, bookingId: 1, category: "Decoration",     label: "Floral stage setup",      amount: 55000  },
  { id: 3, bookingId: 1, category: "Audio / Lights", label: "Sound & LED lighting",    amount: 30000  },
  { id: 4, bookingId: 1, category: "Staff Wages",    label: "Serving staff × 20",      amount: 24000  },
  { id: 5, bookingId: 2, category: "Catering",       label: "Lunch for 150 guests",    amount: 52000  },
  { id: 6, bookingId: 2, category: "Decoration",     label: "Basic floral décor",      amount: 18000  },
  { id: 7, bookingId: 3, category: "Catering",       label: "Dinner for 500 guests",   amount: 175000 },
  { id: 8, bookingId: 3, category: "Decoration",     label: "Premium décor package",   amount: 72000  },
  { id: 9, bookingId: 3, category: "Staff Wages",    label: "Full crew",               amount: 30000  },
  { id:10, bookingId: 4, category: "Catering",       label: "Dinner buffet",           amount: 88000  },
  { id:11, bookingId: 4, category: "Audio / Lights", label: "AV setup",                amount: 22000  },
  { id:12, bookingId: 5, category: "Decoration",     label: "Mehndi stage & lights",   amount: 48000  },
  { id:13, bookingId: 5, category: "Catering",       label: "Snacks & dinner",         amount: 38000  },
  { id:14, bookingId: 6, category: "Catering",       label: "Full wedding dinner",     amount: 155000 },
  { id:15, bookingId: 6, category: "Decoration",     label: "Luxury floral package",   amount: 65000  },
  { id:16, bookingId: 7, category: "Catering",       label: "Dinner for 550 guests",   amount: 192000 },
  { id:17, bookingId: 7, category: "Decoration",     label: "Grand stage décor",       amount: 82000  },
  { id:18, bookingId: 7, category: "Staff Wages",    label: "Premium crew",            amount: 36000  },
  { id:19, bookingId: 8, category: "Catering",       label: "Buffet dinner",           amount: 74000  },
  { id:20, bookingId: 8, category: "Decoration",     label: "Standard décor",          amount: 28000  },
];

// ── sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, trend, type = "neutral" }) {
  const styles = {
    neutral: { bg: "bg-white", border: "border-emerald-100/60", iconBg: "bg-emerald-50/50", iconText: "text-emerald-600", text: "text-stone-400" },
    premium: { bg: "bg-emerald-600", border: "border-emerald-700", iconBg: "bg-emerald-700", iconText: "text-emerald-200", text: "text-emerald-100" },
    danger:  { bg: "bg-white", border: "border-emerald-100/60", iconBg: "bg-rose-50", iconText: "text-rose-600", text: "text-stone-400" },
  };
  const s = styles[type];
  
  return (
    <div className={`${s.bg} border ${s.border} rounded-xl p-6 transition-all duration-300 hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[11px] font-medium uppercase tracking-wider ${type === "premium" ? "text-emerald-100" : "text-stone-400"}`}>{label}</span>
        <div className={`w-9 h-9 ${s.iconBg} rounded-lg flex items-center justify-center transition-colors`}>
          <Icon size={16} className={s.iconText} />
        </div>
      </div>
      <div>
        <p className={`font-serif text-2xl font-normal tracking-tight ${type === "premium" ? "text-white" : "text-stone-900"}`}>{value}</p>
        <div className="flex items-center justify-between mt-1">
          <p className={`text-[12px] font-light ${type === "premium" ? "text-emerald-100/80" : "text-stone-400"}`}>{sub}</p>
          {trend !== undefined && (
            <span className={`text-[11px] font-medium tracking-tight px-1.5 py-0.5 rounded ${type === "premium" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"}`}>
              {trend}% margin
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpenseRow({ expense, onDelete }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-emerald-50 last:border-0 group">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-medium text-stone-800 truncate">{expense.label}</span>
        <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase mt-0.5">{expense.category}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[13px] font-serif text-stone-900 font-medium">{currency(expense.amount)}</span>
        <button onClick={() => onDelete(expense.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-stone-300 hover:text-rose-600 rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function MonthBar({ month, revenue, expense, profit, maxRevenue }) {
  const revPct = maxRevenue ? Math.round((revenue / maxRevenue) * 100) : 0;
  const expPct = maxRevenue ? Math.round((expense / maxRevenue) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 group cursor-pointer">
      <div className="flex items-end gap-[3px] h-28 relative">
        <div className="flex-1 flex items-end gap-[2px] h-full bg-emerald-50/30 rounded-t-md p-1">
          <div
            className="flex-1 bg-emerald-600 rounded-[2px] transition-all duration-500 hover:bg-emerald-700"
            style={{ height: `${revPct}%`, minHeight: revenue ? 4 : 0 }}
            title={`Revenue: ${currency(revenue)}`}
          />
          <div
            className="flex-1 bg-emerald-200 rounded-[2px] transition-all duration-500 hover:bg-emerald-300"
            style={{ height: `${expPct}%`, minHeight: expense ? 4 : 0 }}
            title={`Expenses: ${currency(expense)}`}
          />
        </div>
      </div>
      <p className="text-[11px] text-center text-stone-400 font-medium tracking-tight">{month}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Management() {
  const [bookings]    = useState(SEED_BOOKINGS);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [selectedYear, setSelectedYear]       = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth]     = useState(null);      // null = all
  const [selectedBookingId, setSelectedBookingId] = useState(null);  // for expense panel
  const [hallFilter, setHallFilter]           = useState("all");

  // new expense form
  const [newExp, setNewExp] = useState({ category: EXPENSE_CATEGORIES[0], label: "", amount: "" });
  const [addingTo, setAddingTo] = useState(null); // bookingId

  // ── derived ─────────────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const d = new Date(b.date);
      const yearMatch  = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      const hallMatch  = hallFilter === "all" || b.hall === hallFilter;
      return yearMatch && monthMatch && hallMatch;
    });
  }, [bookings, selectedYear, selectedMonth, hallFilter]);

  const expensesByBooking = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      if (!map[e.bookingId]) map[e.bookingId] = [];
      map[e.bookingId].push(e);
    });
    return map;
  }, [expenses]);

  const totalRevenue = filteredBookings.reduce((s, b) => s + b.revenue, 0);
  const totalExpense = filteredBookings.reduce((s, b) => {
    return s + (expensesByBooking[b.id] || []).reduce((a, e) => a + Number(e.amount), 0);
  }, 0);
  const totalProfit  = totalRevenue - totalExpense;
  const margin       = pct(totalProfit, totalRevenue);

  const monthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const bks = bookings.filter((b) => {
        const d = new Date(b.date);
        return d.getFullYear() === selectedYear && d.getMonth() === idx &&
          (hallFilter === "all" || b.hall === hallFilter);
      });
      const rev = bks.reduce((s, b) => s + b.revenue, 0);
      const exp = bks.reduce((s, b) => s + (expensesByBooking[b.id] || []).reduce((a, e) => a + Number(e.amount), 0), 0);
      return { month: m, revenue: rev, expense: exp, profit: rev - exp, bookings: bks.length };
    });
  }, [bookings, expenses, selectedYear, hallFilter, expensesByBooking]);

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      (expensesByBooking[b.id] || []).forEach((e) => {
        map[e.category] = (map[e.category] || 0) + Number(e.amount);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings, expensesByBooking]);

  // ── actions ──────────────────────────────────────────────────────────────────
  function addExpense(bookingId) {
    if (!newExp.label || !newExp.amount) return;
    setExpenses((prev) => [
      ...prev,
      { id: Date.now(), bookingId, category: newExp.category, label: newExp.label, amount: Number(newExp.amount) },
    ]);
    setNewExp({ category: EXPENSE_CATEGORIES[0], label: "", amount: "" });
    setAddingTo(null);
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedBookingExpenses = selectedBookingId ? (expensesByBooking[selectedBookingId] || []) : [];
  const selectedBookingRevenue  = selectedBooking?.revenue || 0;
  const selectedBookingExpense  = selectedBookingExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const selectedBookingProfit   = selectedBookingRevenue - selectedBookingExpense;

  return (
    <div className="min-h-screen bg-emerald-50/20 text-stone-900 p-6 md:p-8 antialiased font-sans selection:bg-emerald-100">
      
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-emerald-100/70">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700/80">Management Suite</span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900 mt-1">
            Expense & Profit Ledger
          </h1>
        </div>

        {/* Filters Matrix */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Hall filter */}
          <div className="bg-emerald-50 p-1 rounded-lg flex gap-0.5 border border-emerald-100/50">
            {["all","Hall A","Hall B"].map((h) => (
              <button key={h} onClick={() => setHallFilter(h)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all
                  ${hallFilter === h
                    ? "bg-white text-emerald-800 shadow-2xs font-semibold"
                    : "text-stone-500 hover:text-emerald-700"}`}>
                {h === "all" ? "Both Halls" : h}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-emerald-100 rounded-lg text-[12px] font-medium text-stone-700 outline-none focus:border-emerald-400 cursor-pointer">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600/60 pointer-events-none" />
          </div>

          {/* Month Custom Pills */}
          <div className="flex gap-1 overflow-x-auto max-w-full pb-1 xl:pb-0">
            <button onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all
                ${selectedMonth === null ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-emerald-100 hover:border-emerald-300"}`}>
              All Months
            </button>
            {MONTHS.map((m, i) => (
              <button key={m} onClick={() => setSelectedMonth(i === selectedMonth ? null : i)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all
                  ${selectedMonth === i ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-stone-500 border-emerald-100 hover:border-emerald-300"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Total Gross Revenue" value={currency(totalRevenue)} sub={`${filteredBookings.length} Bookings retained`} icon={ArrowUpRight} type="neutral" />
        <KpiCard label="Aggregated Costs" value={currency(totalExpense)} sub="Operational expenses" icon={Receipt} type="danger" />
        <KpiCard label="Net System Profit" value={currency(totalProfit)} sub={totalProfit >= 0 ? "Margin optimization steady" : "Deficit performance"} icon={DollarSign} type="premium" trend={margin} />
        <KpiCard label="Average Yield / Event" value={currency(filteredBookings.length ? Math.round(totalProfit / filteredBookings.length) : 0)} sub="Distributed performance" icon={Package} type="neutral" />
      </div>

      {/* ── Overviews ────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">

        {/* Chart Component Card */}
        <div className="bg-white rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-lg font-normal text-stone-900">Performance Index Overview</h2>
              <p className="text-[11px] text-stone-400 mt-0.5 uppercase tracking-wider">Emerald bar = Gross revenue  ·  Soft green = System outlays</p>
            </div>
            <BarChart3 size={16} className="text-emerald-600" />
          </div>
          <div className="grid grid-cols-12 gap-3 items-end pt-4 border-b border-emerald-50 pb-2">
            {monthlyData.map((m) => (
              <MonthBar key={m.month} {...m} maxRevenue={maxRevenue} />
            ))}
          </div>

          {/* Secondary Table Elements */}
          <div className="mt-6">
            <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
              {monthlyData.filter((m) => m.revenue > 0).map((m) => (
                <div key={m.month} className="flex items-center justify-between text-[12px] p-2 rounded-lg hover:bg-emerald-50/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-stone-800 w-8">{m.month}</span>
                    <span className="text-stone-400 text-[11px]">{m.bookings} operations</span>
                  </div>
                  <div className="flex gap-6 text-right">
                    <span className="text-stone-400 font-light">{currency(m.revenue)}</span>
                    <span className={`font-serif font-medium ${m.profit >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                      {m.profit >= 0 ? "+" : ""}{currency(m.profit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Matrix Distribution */}
        <div className="bg-white rounded-xl border border-emerald-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-normal text-stone-900 mb-5">Expense Segments</h2>
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Inbox size={24} className="text-emerald-200 mx-auto mb-2" />
                <p className="text-stone-400 text-[12px]">No logs captured</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
                {categoryBreakdown.map(([cat, amt]) => {
                  const p = pct(amt, totalExpense);
                  return (
                    <div key={cat} className="group">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[12px] font-medium text-stone-700">{cat}</span>
                        <span className="text-[11px] font-mono text-emerald-700 font-medium">{p}%</span>
                      </div>
                      <div className="w-full h-[3px] bg-emerald-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${p}%` }} />
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 font-serif">{currency(amt)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimal Border Layout Chart */}
          <div className="mt-6 pt-5 border-t border-emerald-50">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f0fdf4" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#059669" strokeWidth="2.5"
                    strokeDasharray={`${Math.max(0, margin)} ${100 - Math.max(0, margin)}`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                  {margin}%
                </span>
              </div>
              <div>
                <p className="text-[12px] font-medium text-stone-800">System Performance</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  {margin >= 40 ? "Excellent distribution" : margin >= 25 ? "Healthy asset yield" : "Cost pressure action"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Core Spreadsheet & Inspector Panel ──────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

        {/* Master Ledger List */}
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-50 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-lg font-normal text-stone-900">Ledger Distribution</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">Toggle rows to evaluate custom line allocations</p>
            </div>
            <SlidersHorizontal size={14} className="text-emerald-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/30 border-b border-emerald-100/70">
                  {["Client Profiling","Asset","Type","Target Date","Gross Yield","Operational Cost","Net Yield",""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50/60">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-stone-400 text-[12px]">
                      No statements found matching your targets.
                    </td>
                  </tr>
                )}
                {filteredBookings.map((b) => {
                  const bExp = (expensesByBooking[b.id] || []).reduce((s, e) => s + Number(e.amount), 0);
                  const bPro = b.revenue - bExp;
                  const isSel = selectedBookingId === b.id;
                  return (
                    <tr key={b.id}
                      onClick={() => setSelectedBookingId(isSel ? null : b.id)}
                      className={`cursor-pointer transition-all duration-150
                        ${isSel ? "bg-emerald-50/40" : "hover:bg-emerald-50/10"}`}>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border
                          ${b.hall === "Hall A" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-teal-50 text-teal-800 border-teal-100"}`}>
                          {b.hall}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-400 font-light">
                        {new Date(b.date).toLocaleDateString("en-PK", { day:"numeric", month:"short" })}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-serif font-medium text-stone-800">{currency(b.revenue)}</td>
                      <td className="px-5 py-3.5 text-[13px] font-serif text-rose-600">{currency(bExp)}</td>
                      <td className={`px-5 py-3.5 text-[13px] font-serif font-medium ${bPro >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {bPro >= 0 ? "+" : ""}{currency(bPro)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingTo(b.id); setSelectedBookingId(b.id); }}
                          className="text-[11px] font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
                          + Add Expense
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Secondary Metric Inspector */}
        <div className="bg-white rounded-xl border border-emerald-100 flex flex-col overflow-hidden">
          {!selectedBookingId ? (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 bg-emerald-50/50 rounded-full flex items-center justify-center mb-3">
                <Receipt size={16} className="text-emerald-600" />
              </div>
              <p className="text-[13px] font-medium text-stone-700">Statement Not Loaded</p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">Select any transaction record to inspect or adjust line costs.</p>
            </div>
          ) : (
            <>
              {/* Panel Inspector Header */}
              <div className="p-5 border-b border-emerald-50 bg-emerald-50/20">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200/50">{selectedBooking?.hall}</span>
                    <p className="font-serif text-base font-normal text-stone-900 mt-1.5">{selectedBooking?.client}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {selectedBooking?.event} · {new Date(selectedBooking?.date).toLocaleDateString("en-PK", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedBookingId(null)} className="text-stone-400 hover:text-stone-900 p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* Micro metrics matrix */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: "Gross Yield", value: currency(selectedBookingRevenue), cls: "text-stone-800" },
                    { label: "Costs Filed", value: currency(selectedBookingExpense), cls: "text-rose-600" },
                    { label: "Net Allocation", value: currency(selectedBookingProfit), cls: selectedBookingProfit >= 0 ? "text-emerald-700 font-medium" : "text-rose-600" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-lg p-2.5 border border-emerald-100/40">
                      <p className="text-[9px] text-stone-400 uppercase tracking-tight mb-1">{k.label}</p>
                      <p className={`text-[12px] font-serif ${k.cls}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense List Display */}
              <div className="flex-1 overflow-y-auto px-5 py-2 max-h-64">
                {selectedBookingExpenses.length === 0 ? (
                  <p className="text-[12px] text-stone-400 text-center py-8">No specific operational outlays logged.</p>
                ) : (
                  selectedBookingExpenses.map((e) => (
                    <ExpenseRow key={e.id} expense={e} onDelete={deleteExpense} />
                  ))
                )}
              </div>

              {/* Add form updates */}
              <div className="border-t border-emerald-50 p-4 bg-emerald-50/10">
                {addingTo === selectedBookingId ? (
                  <div className="flex flex-col gap-2">
                    <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                      className="w-full px-3 py-1.5 border border-emerald-100 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white text-stone-700">
                      {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input value={newExp.label} onChange={(e) => setNewExp({ ...newExp, label: e.target.value })}
                      placeholder="Line item description"
                      className="w-full px-3 py-1.5 border border-emerald-100 rounded-lg text-[12px] outline-none focus:border-emerald-500 placeholder:text-stone-300" />
                    <input type="number" value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                      placeholder="Amount (₨)"
                      className="w-full px-3 py-1.5 border border-emerald-100 rounded-lg text-[12px] outline-none focus:border-emerald-500 placeholder:text-stone-300 font-serif" />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => addExpense(selectedBookingId)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium rounded-lg transition-colors">
                        Add Expense
                      </button>
                      <button onClick={() => setAddingTo(null)}
                        className="px-3 py-1.5 bg-white text-stone-600 border border-emerald-100 text-[12px] font-medium rounded-lg hover:bg-emerald-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(selectedBookingId)}
                    className="w-full py-2 border border-dashed border-emerald-200 rounded-lg text-[12px] font-medium text-emerald-700 hover:border-emerald-400 hover:bg-white transition-all flex items-center justify-center gap-1.5">
                    <Plus size={13} /> Add Line Outlay
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}