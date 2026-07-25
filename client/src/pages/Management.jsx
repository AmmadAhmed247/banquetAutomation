import { useState, useMemo } from "react";
import {
  TrendingUp, Plus, Trash2, Receipt,
  ChevronDown, BarChart3, DollarSign, Package,
  SlidersHorizontal, X, ArrowUpRight, Inbox, Calendar
} from "lucide-react";
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getAllBookings } from "../lib/hooks/booking.hook";

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EXPENSE_CATEGORIES = ["Catering", "Decoration", "Audio / Lights", "Staff Wages", "Cleaning", "Maintenance", "Utilities", "Marketing", "Miscellaneous"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function currency(n) {
  return "₨ " + Number(n || 0).toLocaleString("en-PK");
}
function compactCurrency(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000) return `₨${Math.round(v / 1000)}K`;
  return `₨${v}`;
}
function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED_BOOKINGS = [
  { id: 1, hall: "Hall A", client: "Rania & Omar", event: "Wedding", date: "2026-05-03", revenue: 275000 },
  { id: 2, hall: "Hall B", client: "Sana & Bilal", event: "Nikkah", date: "2026-05-03", revenue: 120000 },
  { id: 3, hall: "Hall A", client: "Fatima & Usman", event: "Wedding", date: "2026-05-14", revenue: 310000 },
  { id: 4, hall: "Hall B", client: "Ayesha & Hassan", event: "Reception", date: "2026-05-20", revenue: 180000 },
  { id: 5, hall: "Hall A", client: "Zara & Khalid", event: "Mehndi", date: "2026-06-05", revenue: 145000 },
  { id: 6, hall: "Hall B", client: "Sara & Ahmed", event: "Wedding", date: "2026-06-12", revenue: 290000 },
  { id: 7, hall: "Hall A", client: "Hira & Faisal", event: "Wedding", date: "2026-06-19", revenue: 340000 },
  { id: 8, hall: "Hall B", client: "Mariam & Tariq", event: "Reception", date: "2026-07-08", revenue: 160000 },
];

const SEED_EXPENSES = [
  { id: 1, bookingId: 1, category: "Catering", label: "Dinner for 400 guests", amount: 140000 },
  { id: 2, bookingId: 1, category: "Decoration", label: "Floral stage setup", amount: 55000 },
  { id: 3, bookingId: 1, category: "Audio / Lights", label: "Sound & LED lighting", amount: 30000 },
  { id: 4, bookingId: 1, category: "Staff Wages", label: "Serving staff × 20", amount: 24000 },
  { id: 5, bookingId: 2, category: "Catering", label: "Lunch for 150 guests", amount: 52000 },
  { id: 6, bookingId: 2, category: "Decoration", label: "Basic floral décor", amount: 18000 },
  { id: 7, bookingId: 3, category: "Catering", label: "Dinner for 500 guests", amount: 175000 },
  { id: 8, bookingId: 3, category: "Decoration", label: "Premium décor package", amount: 72000 },
  { id: 9, bookingId: 3, category: "Staff Wages", label: "Full crew", amount: 30000 },
  { id: 10, bookingId: 4, category: "Catering", label: "Dinner buffet", amount: 88000 },
  { id: 11, bookingId: 4, category: "Audio / Lights", label: "AV setup", amount: 22000 },
  { id: 12, bookingId: 5, category: "Decoration", label: "Mehndi stage & lights", amount: 48000 },
  { id: 13, bookingId: 5, category: "Catering", label: "Snacks & dinner", amount: 38000 },
  { id: 14, bookingId: 6, category: "Catering", label: "Full wedding dinner", amount: 155000 },
  { id: 15, bookingId: 6, category: "Decoration", label: "Luxury floral package", amount: 65000 },
  { id: 16, bookingId: 7, category: "Catering", label: "Dinner for 550 guests", amount: 192000 },
  { id: 17, bookingId: 7, category: "Decoration", label: "Grand stage décor", amount: 82000 },
  { id: 18, bookingId: 7, category: "Staff Wages", label: "Premium crew", amount: 36000 },
  { id: 19, bookingId: 8, category: "Catering", label: "Buffet dinner", amount: 74000 },
  { id: 20, bookingId: 8, category: "Decoration", label: "Standard décor", amount: 28000 },
];

// ── shared chart tooltip ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3.5 py-2.5 text-[12px]">
      <p className="font-semibold text-stone-800 mb-1.5">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-stone-500">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-medium text-stone-800">{currency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, trend}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-green-400`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[12px] text-stone-400">{sub}</p>
          {trend !== undefined && (
            <span
              className={`text-[11px] font-semibold tracking-tight px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
              }`}
            >
              <TrendingUp size={11} className={trend < 0 ? "rotate-180" : ""} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpenseRow({ expense, onDelete }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0 group">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-medium text-stone-800 truncate">{expense.label}</span>
        <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase mt-0.5">{expense.category}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[13px] text-stone-900 font-semibold">{currency(expense.amount)}</span>
        <button onClick={() => onDelete(expense.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-stone-300 hover:text-rose-600 rounded">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function EventRow({ booking }) {
  const d = daysUntil(booking.date);
  const status =
    d < 0 ? { label: "Past", cls: "bg-stone-100 text-stone-500" }
    : d === 0 ? { label: "Today", cls: "bg-amber-50 text-amber-700" }
    : d <= 7 ? { label: "This week", cls: "bg-blue-50 text-blue-700" }
    : { label: "Upcoming", cls: "bg-stone-100 text-stone-500" };

  const dotColor = booking.hall === "Hall A" ? "bg-emerald-500" : "bg-teal-500";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className={`w-9 h-9 rounded-full ${dotColor}/10 flex items-center justify-center flex-shrink-0`}>
        <Calendar size={15} className={booking.hall === "Hall A" ? "text-emerald-600" : "text-teal-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-stone-800 truncate">{booking.client}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${status.cls}`}>{status.label}</span>
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5">{booking.hall} · {booking.event}</p>
      </div>
      <span className="text-[11px] text-stone-400 flex-shrink-0">
        {new Date(booking.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Management() {
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [hallFilter, setHallFilter] = useState("all");

  const { data: bookings = [] } = getAllBookings() || {};

  const [newExp, setNewExp] = useState({ category: EXPENSE_CATEGORIES[0], label: "", amount: "" });
  const [addingTo, setAddingTo] = useState(null);

  // ── derived ─────────────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const d = new Date(b.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      const hallMatch = hallFilter === "all" || b.hall === hallFilter;
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
  const totalProfit = totalRevenue - totalExpense;
  const margin = pct(totalProfit, totalRevenue);

  // Revenue vs Expenses trend (line + area)
  const monthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const bks = bookings.filter((b) => {
        const d = new Date(b.date);
        return d.getFullYear() === selectedYear && d.getMonth() === idx &&
          (hallFilter === "all" || b.hall === hallFilter);
      });
      const rev = bks.reduce((s, b) => s + b.revenue, 0);
      const exp = bks.reduce((s, b) => s + (expensesByBooking[b.id] || []).reduce((a, e) => a + Number(e.amount), 0), 0);
      return { month: m, Revenue: rev, Expenses: exp, profit: rev - exp, bookings: bks.length };
    });
  }, [bookings, expenses, selectedYear, hallFilter, expensesByBooking]);

  // Hall A vs Hall B monthly comparison (grouped bars)
  const hallMonthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const forHall = (hall) =>
        bookings
          .filter((b) => {
            const d = new Date(b.date);
            return d.getFullYear() === selectedYear && d.getMonth() === idx && b.hall === hall;
          })
          .reduce((s, b) => s + b.revenue, 0);
      return { month: m, "Hall A": forHall("Hall A"), "Hall B": forHall("Hall B") };
    });
  }, [bookings, selectedYear]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      (expensesByBooking[b.id] || []).forEach((e) => {
        map[e.category] = (map[e.category] || 0) + Number(e.amount);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings, expensesByBooking]);

  const upcomingEvents = useMemo(() => {
    return [...bookings]
      .filter((b) => daysUntil(b.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [bookings]);

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
  const selectedBookingRevenue = selectedBooking?.revenue || 0;
  const selectedBookingExpense = selectedBookingExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const selectedBookingProfit = selectedBookingRevenue - selectedBookingExpense;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-8 antialiased selection:bg-emerald-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Management Suite</span>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mt-1">
            Expense & Profit Ledger
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200">
            {["all", "Hall A", "Hall B"].map((h) => (
              <button key={h} onClick={() => setHallFilter(h)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all
                  ${hallFilter === h
                    ? "bg-white text-stone-900 shadow-sm font-semibold"
                    : "text-stone-500 hover:text-stone-800"}`}>
                {h === "all" ? "Both Halls" : h}
              </button>
            ))}
          </div>

          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-[12px] font-medium text-stone-700 outline-none focus:border-emerald-400 cursor-pointer">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="flex gap-1 overflow-x-auto max-w-full pb-1 xl:pb-0">
            <button onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all
                ${selectedMonth === null ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}>
              All Months
            </button>
            {MONTHS.map((m, i) => (
              <button key={m} onClick={() => setSelectedMonth(i === selectedMonth ? null : i)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all
                  ${selectedMonth === i ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Total Gross Revenue" value={currency(totalRevenue)} sub={`${filteredBookings.length} bookings`} icon={ArrowUpRight} badgeColor="bg-blue-600" />
        <KpiCard label="Aggregated Costs" value={currency(totalExpense)} sub="Operational expenses" icon={Receipt} badgeColor="bg-rose-500" />
        <KpiCard label="Net System Profit" value={currency(totalProfit)} sub={totalProfit >= 0 ? "Margin holding steady" : "Running at a deficit"} icon={DollarSign} badgeColor="bg-emerald-600" trend={margin} />
        <KpiCard label="Average Yield / Event" value={currency(filteredBookings.length ? Math.round(totalProfit / filteredBookings.length) : 0)} sub="Per booking" icon={Package} badgeColor="bg-violet-600" />
      </div>

      {/* ── Trend + Activity ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-stone-900">Revenue vs Expenses</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {currency(totalRevenue)} booked against {currency(totalExpense)} in costs · {selectedYear}
              </p>
            </div>
            <BarChart3 size={16} className="text-emerald-600" />
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F1EF" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#78716C" }}
              />
              <Area type="monotone" dataKey="Revenue" stroke="#059669" strokeWidth={2} fill="url(#revFill)" />
              <Line type="monotone" dataKey="Expenses" stroke="#A8A29E" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-stone-900">Upcoming Events</h2>
          </div>
          <p className="text-[11px] text-stone-400 mb-3">{upcomingEvents.length} scheduled</p>

          <div className="flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                <p className="text-stone-400 text-[12px]">No upcoming bookings</p>
              </div>
            ) : (
              upcomingEvents.map((b) => <EventRow key={b.id} booking={b} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Hall Performance + Category Breakdown ───────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-stone-900">Hall Performance</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">Monthly revenue, Hall A vs Hall B · {selectedYear}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hallMonthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke="#F1F1EF" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" align="right" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#78716C" }} />
              <Bar dataKey="Hall A" fill="#059669" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Hall B" fill="#0D9488" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-stone-900 mb-5">Expense Breakdown</h2>
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-12">
                <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                <p className="text-stone-400 text-[12px]">No expenses logged</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">
                {categoryBreakdown.map(([cat, amt]) => {
                  const p = pct(amt, totalExpense);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[12px] font-medium text-stone-700">{cat}</span>
                        <span className="text-[11px] font-semibold text-emerald-700">{p}%</span>
                      </div>
                      <div className="w-full h-[5px] bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${p}%` }} />
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">{currency(amt)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#F0FDF4" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#059669" strokeWidth="2.5"
                    strokeDasharray={`${Math.max(0, margin)} ${100 - Math.max(0, margin)}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stone-900">
                  {margin}%
                </span>
              </div>
              <div>
                <p className="text-[12px] font-medium text-stone-800">Profit Margin</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  {margin >= 40 ? "Excellent distribution" : margin >= 25 ? "Healthy yield" : "Costs need attention"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ledger & Inspector ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
            <div>
              <h2 className="text-[15px] font-semibold text-stone-900">Booking Ledger</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">Select a row to inspect or add line costs</p>
            </div>
            <SlidersHorizontal size={14} className="text-stone-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {["Client", "Hall", "Event", "Date", "Revenue", "Costs", "Profit", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-stone-400 text-[12px]">
                      No bookings found for these filters.
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
                      className={`cursor-pointer transition-colors duration-150 ${isSel ? "bg-emerald-50/50" : "hover:bg-stone-50"}`}>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border
                          ${b.hall === "Hall A" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>
                          {b.hall}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-400">
                        {new Date(b.date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(b.revenue)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-rose-600">{currency(bExp)}</td>
                      <td className={`px-5 py-3.5 text-[13px] font-semibold ${bPro >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {bPro >= 0 ? "+" : ""}{currency(bPro)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingTo(b.id); setSelectedBookingId(b.id); }}
                          className="text-[11px] font-medium px-2.5 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
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

        <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden">
          {!selectedBookingId ? (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-3">
                <Receipt size={16} className="text-stone-400" />
              </div>
              <p className="text-[13px] font-medium text-stone-700">No booking selected</p>
              <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">Select a row to inspect or adjust its costs.</p>
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-stone-100 bg-stone-50/60">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-600 border border-stone-200">{selectedBooking?.hall}</span>
                    <p className="text-[14px] font-semibold text-stone-900 mt-1.5">{selectedBooking?.client}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {selectedBooking?.event} · {new Date(selectedBooking?.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedBookingId(null)} className="text-stone-400 hover:text-stone-900 p-1">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: "Revenue", value: currency(selectedBookingRevenue), cls: "text-stone-800" },
                    { label: "Costs", value: currency(selectedBookingExpense), cls: "text-rose-600" },
                    { label: "Profit", value: currency(selectedBookingProfit), cls: selectedBookingProfit >= 0 ? "text-emerald-700" : "text-rose-600" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-lg p-2.5 border border-stone-100">
                      <p className="text-[9px] text-stone-400 uppercase tracking-tight mb-1">{k.label}</p>
                      <p className={`text-[12px] font-semibold ${k.cls}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-2 max-h-64">
                {selectedBookingExpenses.length === 0 ? (
                  <p className="text-[12px] text-stone-400 text-center py-8">No costs logged for this booking.</p>
                ) : (
                  selectedBookingExpenses.map((e) => (
                    <ExpenseRow key={e.id} expense={e} onDelete={deleteExpense} />
                  ))
                )}
              </div>

              <div className="border-t border-stone-100 p-4 bg-stone-50/40">
                {addingTo === selectedBookingId ? (
                  <div className="flex flex-col gap-2">
                    <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white text-stone-700">
                      {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input value={newExp.label} onChange={(e) => setNewExp({ ...newExp, label: e.target.value })}
                      placeholder="Line item description"
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 placeholder:text-stone-300" />
                    <input type="number" value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                      placeholder="Amount (₨)"
                      className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 placeholder:text-stone-300" />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => addExpense(selectedBookingId)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium rounded-lg transition-colors">
                        Add Expense
                      </button>
                      <button onClick={() => setAddingTo(null)}
                        className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(selectedBookingId)}
                    className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-[12px] font-medium text-stone-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-white transition-all flex items-center justify-center gap-1.5">
                    <Plus size={13} /> Add Line Cost
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