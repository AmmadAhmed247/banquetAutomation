import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronDown, ChevronRight, X, Wallet, Inbox, PlusCircle,
  Layers, Zap, Trash2, Plus, Loader2, ClipboardList, Receipt, Search, Droplet,
} from "lucide-react";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";
import { getAllMonthlyExpenses, useCreateMonthlyExpense, useDeleteMonthlyExpense } from "../lib/hooks/monthlyExpense.hook";
import { getAllDailyExpenses } from "../lib/hooks/dailyExpense.hook";
import { getAllExpenses } from "../lib/hooks/expense.hook";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
// ── constants ────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel"];
const DRINK_SERVICES = ["Pepsi Co.", "Coca Cola Co."];

// Semantic duotone: gold = spend/actions, teal = revenue/money-in
const GOLD = "#b45309";
const GOLD_SOFT = "#fef3c7";
const TEAL = "#0f766e";
const TEAL_SOFT = "#ccfbf1";

function currency(n) {
  return "₨ " + Number(n || 0).toLocaleString("en-PK");
}

function normalizeBooking(b) {
  return {
    id: b.id,
    r_no: b.r_no,
    hall: b.venue,
    client: b.client,
    event: b.event,
    date: b.date,
    revenue: Number(b.total_amount) || 0,
  };
}

function extractCrates(label = "") {
  const text = String(label || "");

  // 1. Number next to "crate / crates / crt"
  let match = text.match(/(\d+)\s*(crate|crates|crt)/i);
  if (match) return Number(match[1]);

  // 2. Number after "pay to" / "for"
  match = text.match(/(?:pay\s*to|for|paid)[^\d]*(\d+)/i);
  if (match) return Number(match[1]);

  // 3. Just take the first number (this will be used for new data)
  match = text.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function isPepsi(label = "", category = "") {
  return (
    /pepsi/i.test(label) ||
    /pepsi/i.test(category)
  );
}

function isCoke(label = "", category = "") {
  return (
    /coca\s*cola|coke/i.test(label) ||
    /coca\s*cola|coke/i.test(category)
  );
}



function matches(query, ...fields) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return fields.some((f) => String(f || "").toLowerCase().includes(q));
}

// Count-up animation for KPI numbers
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    let raf;
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ── shared building blocks ───────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-[13px] outline-none focus:bg-white focus:border-stone-300 transition-colors"
      />
    </div>
  );
}

function SectionHeader({ title, sub, children }) {
  return (
    <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-[14px] font-semibold text-stone-900">{title}</h2>
        {sub && <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16 text-stone-400 text-[13px]">
        <Inbox size={26} className="mx-auto mb-2 text-stone-200" />
        {text}
      </td>
    </tr>
  );
}

function KpiCard({ label, value, sub, icon: Icon, tone = "neutral" }) {
  const animated = useCountUp(value);
  const color = tone === "revenue" ? TEAL : "#1c1917";
  return (
    <div className="fade-up bg-white border border-stone-200 rounded-xl p-5 transition-shadow hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-stone-400">{label}</span>
        <Icon size={15} style={{ color: tone === "revenue" ? TEAL : "#d6d3d1" }} />
      </div>
      <p className="text-xl font-semibold tracking-tight" style={{ color }}>
        {tone === "revenue" ? currency(animated) : animated}
      </p>
      <p className="text-[12px] text-stone-400 mt-1">{sub}</p>
    </div>
  );
}

function DrinkStatRow({ name, crates, paid }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <span className="text-[13px] font-medium text-stone-800">{name}</span>
      <div className="text-right">
        <p className="text-[13px] font-semibold text-stone-900">{crates} crates</p>
        <p className="text-[11px] font-medium" style={{ color: GOLD }}>{currency(paid)} spent</p>
      </div>
    </div>
  );
}

// Bar grows from 0 on mount / whenever the value changes
function SalesRow({ name, amount, shareOfMax }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(0);
    const t = setTimeout(() => setWidth(shareOfMax), 60);
    return () => clearTimeout(t);
  }, [shareOfMax]);

  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] font-medium text-stone-700">{name}</span>
        <span className="text-[13px] font-semibold" style={{ color: TEAL }}>{currency(amount)}</span>
      </div>
      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: TEAL }}
        />
      </div>
    </div>
  );
}

function CategoryBar({ label, percent, amount }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(0);
    const t = setTimeout(() => setWidth(percent), 60);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[12px] font-medium text-stone-700">{label}</span>
        <span className="text-[11px] font-semibold" style={{ color: GOLD }}>{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${width}%`, backgroundColor: GOLD }} />
      </div>
      <p className="text-[11px] text-stone-400 mt-1">{currency(amount)}</p>
    </div>
  );
}

function DetailSidebar({ title, subtitle, children, onClose }) {
  return (
    <div className="fade-up bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden sticky top-6">
      <div className="p-5 border-b border-stone-100 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-medium text-stone-400">{title}</span>
          <p className="text-[14px] font-semibold text-stone-900 mt-1">{subtitle}</p>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-900 p-1 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(100vh-260px)]">
        {children}
      </div>
    </div>
  );
}

export default function BookingsAddonsPage() {
  const addonsQuery = getAllAddons();
  const bookingsQuery = getAllBookings() || {};
  const monthlyExpensesQuery = getAllMonthlyExpenses();
  const dailyExpensesQuery = getAllDailyExpenses();
  const expensesQuery = getAllExpenses() || {};

  const addons = Array.isArray(addonsQuery.data) ? addonsQuery.data : [];
  const rawBookings = Array.isArray(bookingsQuery.data) ? bookingsQuery.data : [];
  const monthlyExpenses = Array.isArray(monthlyExpensesQuery.data) ? monthlyExpensesQuery.data : [];
  const dailyExpenses = Array.isArray(dailyExpensesQuery.data)
    ? dailyExpensesQuery.data
    : dailyExpensesQuery.data?.dailyExpenses || [];
  const rawMonthlyExpenses = expensesQuery.data;
  const standardExpenses = Array.isArray(rawMonthlyExpenses)
    ? rawMonthlyExpenses
    : rawMonthlyExpenses?.data || [];

  const isLoading = [
    addonsQuery, bookingsQuery, monthlyExpensesQuery, dailyExpensesQuery, expensesQuery,
  ].some((q) => q.isLoading);

  const bookings = useMemo(() => rawBookings.map(normalizeBooking), [rawBookings]);
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [hallFilter, setHallFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("Service Performance");

  const [bookingSearch, setBookingSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [monthlySearch, setMonthlySearch] = useState("");
  const [standardSearch, setStandardSearch] = useState("");
  const [dailySearch, setDailySearch] = useState("");
  

  const [addingMonthly, setAddingMonthly] = useState(false);
  const [newMonthly, setNewMonthly] = useState({
    category: MONTHLY_EXPENSE_CATEGORIES[0],
    label: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: CURRENT_YEAR,
  });

  const filteredDailyExpenses = useMemo(() => {
    return dailyExpenses.filter((e) => {
      const d = new Date(e.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === "all" || d.getMonth() === MONTHS.indexOf(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [dailyExpenses, selectedYear, selectedMonth]);

  const searchedDailyExpenses = useMemo(
    () => filteredDailyExpenses.filter((e) => matches(dailySearch, e.label, e.category)),
    [filteredDailyExpenses, dailySearch]
  );

const drinkStats = useMemo(() => {
  const result = {
    pepsi: { crates: 0, paid: 0 },
    coke: { crates: 0, paid: 0 },
  };

  filteredDailyExpenses.forEach((e) => {
    const amount = Number(e.amount || 0);
    const crates = extractCrates(e.label);

    if (isPepsi(e.label, e.category)) {
      result.pepsi.crates += crates;
      result.pepsi.paid += amount;
    }

    if (isCoke(e.label, e.category)) {
      result.coke.crates += crates;
      result.coke.paid += amount;
    }
  });

  return result;
}, [filteredDailyExpenses]);

  const addonsByBooking = useMemo(() => {
    const map = {};
    addons.forEach((a) => {
      if (!map[a.bookingId]) map[a.bookingId] = [];
      map[a.bookingId].push(a);
    });
    return map;
  }, [addons]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const d = new Date(b.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === "all" || d.getMonth() === MONTHS.indexOf(selectedMonth);
      const hallMatch = hallFilter === "all" || b.hall === hallFilter;
      const hasAddons = (addonsByBooking[b.id] || []).length > 0;
      const searchMatch = matches(
        bookingSearch,
        b.client, b.event, b.hall, b.r_no,
        ...(addonsByBooking[b.id] || []).map((a) => a.service)
      );
      return yearMatch && monthMatch && hallMatch && hasAddons && searchMatch;
    });
  }, [bookings, selectedYear, selectedMonth, hallFilter, addonsByBooking, bookingSearch]);

  const serviceBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      (addonsByBooking[b.id] || []).forEach((item) => {
        if (DRINK_SERVICES.includes(item.service)) return;
        if (!map[item.service]) map[item.service] = { service: item.service, count: 0, revenue: 0 };
        map[item.service].count += 1;
        map[item.service].revenue += Number(item.client_price || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings, addonsByBooking]);

  const searchedServiceBreakdown = useMemo(
    () => serviceBreakdown.filter((s) => matches(serviceSearch, s.service)),
    [serviceBreakdown, serviceSearch]
  );

  const totalClientRevenue = serviceBreakdown.reduce((s, x) => s + x.revenue, 0);
  const totalItemsSold = serviceBreakdown.reduce((s, x) => s + x.count, 0);

  const salesRanking = useMemo(() => {
    const rows = [
      { name: "Pepsi Co.", amount: drinkStats.pepsi.paid },
      { name: "Coca Cola Co.", amount: drinkStats.coke.paid },
      ...serviceBreakdown.slice(0, 6).map((s) => ({ name: s.service, amount: s.revenue })),
    ]
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const maxAmount = rows[0]?.amount || 1;
    return rows.map((r) => ({ ...r, shareOfMax: Math.round((r.amount / maxAmount) * 100) }));
  }, [drinkStats, serviceBreakdown]);

  const filteredMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.filter((e) => {
      const yearMatch = e.year === selectedYear;
      const monthMatch = selectedMonth === "all" || e.month === MONTHS.indexOf(selectedMonth) + 1;
      return yearMatch && monthMatch;
    });
  }, [monthlyExpenses, selectedYear, selectedMonth]);

  const searchedMonthlyExpenses = useMemo(
    () => filteredMonthlyExpenses.filter((e) => matches(monthlySearch, e.label, e.category)),
    [filteredMonthlyExpenses, monthlySearch]
  );

  const totalMonthlyOverhead = filteredMonthlyExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const monthlyExpensesByMonth = useMemo(() => {
    const map = {};
    searchedMonthlyExpenses.forEach((e) => {
      if (!map[e.month]) map[e.month] = [];
      map[e.month].push(e);
    });
    return map;
  }, [searchedMonthlyExpenses]);

  const monthlyByCategory = useMemo(() => {
    const map = {};
    filteredMonthlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredMonthlyExpenses]);

  const filteredStandardExpenses = useMemo(() => {
    return standardExpenses.filter((e) => {
      if (!e.created_at) return false;
      const d = new Date(e.created_at);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === "all" || d.getMonth() === MONTHS.indexOf(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [standardExpenses, selectedYear, selectedMonth]);

  const TABS = [
  { id: "Service Performance", label: "Service Performance", icon: PlusCircle },
  { id: "bookings", label: "Bookings", icon: PlusCircle },
  { id: "monthly", label: "Monthly", icon: Zap },
  { id: "standard", label: "Standard", icon: ClipboardList },
  { id: "daily", label: "Daily Expenses", icon: Receipt },
];

  const searchedStandardExpenses = useMemo(() => {
    return filteredStandardExpenses.filter((e) => {
      const linkedBooking = bookings.find((b) => b.id === e.bookingId);
      return matches(standardSearch, e.label, e.category, linkedBooking?.client, linkedBooking?.event);
    });
  }, [filteredStandardExpenses, standardSearch, bookings]);

  function addMonthlyExpense() {
    if (!newMonthly.label || !newMonthly.amount) return;
    createMonthlyExpenseMutation.mutate({
      category: newMonthly.category,
      label: newMonthly.label,
      amount: Number(newMonthly.amount || 0),
      month: newMonthly.month,
      year: newMonthly.year,
    });
    setNewMonthly({
      category: MONTHLY_EXPENSE_CATEGORIES[0],
      label: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
    });
    setAddingMonthly(false);
  }

  function deleteMonthlyExpense(id) {
    deleteMonthlyExpenseMutation.mutate(id);
  }
  const totalDailyExpense = filteredDailyExpenses.reduce(
  (sum, e) => sum + Number(e.amount || 0),
  0
);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
          <p className="text-sm font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-8 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-up {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .fade-in {
          animation: fadeIn 0.35s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .fade-in { animation: none !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="fade-up flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Add-on Services
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200">
            {["all", "Hall A", "Hall B"].map((h) => (
              <button
                key={h}
                onClick={() => setHallFilter(h)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all
                  ${hallFilter === h ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-500 hover:text-stone-800"}`}
              >
                {h === "all" ? "Both Halls" : h}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-[12px] font-medium text-stone-700 outline-none cursor-pointer"
            >
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedMonth("all")}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap
                ${selectedMonth === "all" ? "bg-stone-900 text-white shadow-sm font-semibold" : "text-stone-500 hover:text-stone-800"}`}
            >
              All Months
            </button>
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap
                  ${selectedMonth === m ? "bg-stone-900 text-white shadow-sm font-semibold" : "text-stone-500 hover:text-stone-800"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
{/* ── KPI row ───────────────────────────────────────────────────────── */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <div style={{ animationDelay: "40ms" }}>
    <KpiCard
      label="Client Revenue"
      value={totalClientRevenue}
      sub="Other add-on services"
      icon={Wallet}
      tone="revenue"
    />
  </div>

  <div style={{ animationDelay: "80ms" }}>
    <KpiCard
      label="Items Sold"
      value={totalItemsSold}
      sub="Other add-on services"
      icon={Layers}
    />
  </div>

  <div style={{ animationDelay: "120ms" }}>
    <KpiCard
      label="Monthly Expense"
      value={totalMonthlyOverhead}
      sub="Fixed overhead"
      icon={Zap}
    />
  </div>

  <div style={{ animationDelay: "160ms" }}>
    <KpiCard
      label="Daily Expense"
      value={totalDailyExpense}
      sub="Including beverages"
      icon={Receipt}
    />
  </div>
</div>

{/* ── Tabs ──────────────────────────────────────────────────────────── */}
<div className="fade-up flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg border border-stone-200 overflow-x-auto" style={{ animationDelay: "300ms" }}>
  {TABS.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap
        ${activeTab === tab.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
    >
      <tab.icon size={14} style={{ color: activeTab === tab.id ? GOLD : "#a8a29e" }} />
      {tab.label}
    </button>
  ))}
</div>

{/* ── Service Performance + Chart ── */}
{(!activeTab || activeTab === "Service Performance") && (
  <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-8">
    {/* Left - Clean Table */}
    <div className="xl:col-span-3 fade-up bg-white border border-stone-200 rounded-2xl overflow-hidden" style={{ animationDelay: "180ms" }}>
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-stone-900 flex items-center gap-2">
            <Layers size={15} style={{ color: TEAL }} />
            Service Performance
          </h2>
          <p className="text-[11px] text-stone-400 mt-0.5">Clean numbers — no deep dive</p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: TEAL_SOFT, color: TEAL, borderColor: "#99f6e4" }}
        >
          {serviceBreakdown.length} services
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {["Service", "Sold", "Revenue"].map((h) => (
                <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {serviceBreakdown.length === 0 ? (
              <EmptyRow colSpan={3} text="No services for these filters." />
            ) : (
              serviceBreakdown.map((s) => (
                <tr key={s.service} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{s.service}</td>
                  <td className="px-5 py-3.5 text-[12px] text-stone-500">{s.count}×</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold" style={{ color: TEAL }}>
                    {currency(s.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Right - Modern Donut + Beverages */}
    <div className="xl:col-span-2 flex flex-col gap-4">
      {/* Donut Chart Card */}
      <div className="fade-up bg-white border border-stone-200 rounded-2xl p-5 flex-1" style={{ animationDelay: "220ms" }}>
        <h2 className="text-[14px] font-semibold text-stone-900">Revenue Share</h2>
        <p className="text-[11px] text-stone-400 mt-0.5 mb-4">Top performing services</p>

        {serviceBreakdown.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-stone-400 text-[13px]">
            <Inbox size={22} className="text-stone-200" />
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceBreakdown.slice(0, 8)}
                  dataKey="revenue"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {serviceBreakdown.slice(0, 8).map((_, index) => (
                    <Cell
                      key={index}
                      fill={[
                        TEAL, "#0d9488", "#14b8a6", "#2dd4bf",
                        "#5eead4", "#99f6e4", "#ccfbf1", "#f0fdfa"
                      ][index % 8]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-3 py-2">
                        <p className="text-[12px] font-semibold text-stone-900">{d.service}</p>
                        <p className="text-[12px] font-medium" style={{ color: TEAL }}>{currency(d.revenue)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Beverages mini card */}
      <div className="fade-up bg-white border border-stone-200 rounded-2xl p-5" style={{ animationDelay: "260ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Droplet size={14} style={{ color: GOLD }} />
          <h2 className="text-[14px] font-semibold text-stone-900">Beverages</h2>
        </div>
        <DrinkStatRow name="Pepsi Co." crates={drinkStats.pepsi.crates} paid={drinkStats.pepsi.paid} />
        <DrinkStatRow name="Coca Cola Co." crates={drinkStats.coke.crates} paid={drinkStats.coke.paid} />
      </div>
    </div>
  </div>
)}

     

     
    

      {/* ── Bookings ──────────────────────────────────────────────────────── */}
      {activeTab === "bookings" && (
        <div key="bookings" className={`fade-in grid gap-6 items-start ${selectedBooking ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <SectionHeader title="Bookings with Add-ons" sub="Click a row for details">
              <SearchBar value={bookingSearch} onChange={setBookingSearch} placeholder="Search client, event, service..." />
            </SectionHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["R.No", "Client", "Hall", "Event", "Date", "Items", "Revenue", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBookings.length === 0 ? (
                    <EmptyRow colSpan={8} text="No bookings match your filters." />
                  ) : (
                    filteredBookings.map((b) => {
                      const items = (addonsByBooking[b.id] || []).filter((i) => !DRINK_SERVICES.includes(i.service));
                      const rev = items.reduce((s, x) => s + Number(x.client_price || 0), 0);
                      const isSel = selectedBooking?.id === b.id;

                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBooking(isSel ? null : b)}
                          className={`cursor-pointer transition-colors ${isSel ? "bg-stone-50" : "hover:bg-stone-50"}`}
                        >
                          <td className="px-5 py-3.5 text-[12px] font-mono font-medium text-stone-600">
                            {b.r_no ? `#${b.r_no}` : `#${b.id}`}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}</td>
                          <td className="px-5 py-3.5 text-[11px] font-medium text-stone-500">{b.hall}</td>
                          <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                          <td className="px-5 py-3.5 text-[12px] text-stone-400">
                            {new Date(b.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-stone-500">{items.length}</td>
                          <td className="px-5 py-3.5 text-[13px] font-semibold" style={{ color: TEAL }}>{currency(rev)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <ChevronRight size={16} className={`text-stone-400 inline transition-transform duration-200 ${isSel ? "rotate-90 text-stone-900" : ""}`} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedBooking && (
            <DetailSidebar
              title="ADD-ON BREAKDOWN"
              subtitle={
                <span>
                  {selectedBooking.client}
                  <span className="block text-[11px] font-mono text-stone-400 mt-0.5">
                    R.No. {selectedBooking.r_no || selectedBooking.id}
                  </span>
                </span>
              }
              onClose={() => setSelectedBooking(null)}
            >
              <div className="flex flex-col gap-3">
                {(addonsByBooking[selectedBooking.id] || [])
                  .filter((i) => !DRINK_SERVICES.includes(i.service))
                  .map((item) => (
                    <div key={item.id} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-stone-900 text-[13px]">{item.service}</span>
                        <span className="text-[13px] font-semibold" style={{ color: TEAL }}>{currency(item.client_price)}</span>
                      </div>
                      {item.description && (
                        <p className="text-[12px] text-stone-500">{item.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            </DetailSidebar>
          )}
        </div>
      )}

      {/* ── Monthly Expenses ──────────────────────────────────────────────── */}
      {activeTab === "monthly" && (
        <div key="monthly" className="fade-in flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-[13px] font-semibold text-stone-900">Monthly Overhead</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {currency(totalMonthlyOverhead)} · {selectedMonth === "all" ? selectedYear : `${selectedMonth} ${selectedYear}`}
                </p>
              </div>
              {!addingMonthly && (
                <button
                  onClick={() => setAddingMonthly(true)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  style={{ backgroundColor: GOLD }}
                >
                  <Plus size={12} /> Add Expense
                </button>
              )}
            </div>

            {addingMonthly && (
              <div className="fade-in flex flex-col gap-2 pt-4 mt-4 border-t border-stone-100">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newMonthly.month}
                    onChange={(e) => setNewMonthly({ ...newMonthly, month: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
                  >
                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                  </select>
                  <select
                    value={newMonthly.year}
                    onChange={(e) => setNewMonthly({ ...newMonthly, year: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
                  >
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <select
                  value={newMonthly.category}
                  onChange={(e) => setNewMonthly({ ...newMonthly, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
                >
                  {MONTHLY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input
                  value={newMonthly.label}
                  onChange={(e) => setNewMonthly({ ...newMonthly, label: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
                />
                <input
                  type="number"
                  value={newMonthly.amount}
                  onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })}
                  placeholder="Amount (₨)"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none"
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={addMonthlyExpense} className="flex-1 py-1.5 text-white text-[12px] font-medium rounded-lg" style={{ backgroundColor: GOLD }}>
                    Add
                  </button>
                  <button onClick={() => setAddingMonthly(false)} className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <SectionHeader title="Logged Entries" sub={currency(totalMonthlyOverhead)}>
                <SearchBar value={monthlySearch} onChange={setMonthlySearch} placeholder="Search entries..." />
              </SectionHeader>
              <div className="px-5 py-4">
                {Object.keys(monthlyExpensesByMonth).length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-[13px]">
                    <Inbox size={26} className="mx-auto mb-2 text-stone-200" />
                    No monthly expenses.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Object.keys(monthlyExpensesByMonth)
                      .sort((a, b) => Number(a) - Number(b))
                      .map((monthNum) => {
                        const entries = monthlyExpensesByMonth[monthNum];
                        const monthTotal = entries.reduce((s, e) => s + Number(e.amount || 0), 0);
                        return (
                          <div key={monthNum}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] font-semibold text-stone-400">
                                {MONTHS[Number(monthNum) - 1]} {selectedYear}
                              </p>
                              <span className="text-[11px] font-semibold text-stone-600">{currency(monthTotal)}</span>
                            </div>
                            <div className="space-y-2">
                              {entries.map((e) => (
                                <div key={e.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-stone-50 border border-stone-100 group">
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[13px] font-medium text-stone-800 block truncate">{e.label}</span>
                                    <span className="text-[10px] text-stone-400">{e.category}</span>
                                  </div>
                                  <span className="text-[13px] font-semibold text-stone-900">{currency(e.amount)}</span>
                                  <button
                                    onClick={() => deleteMonthlyExpense(e.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-rose-600 transition-opacity"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="text-[14px] font-semibold text-stone-900 mb-4">By Category</h2>
              {monthlyByCategory.length === 0 ? (
                <p className="text-center py-10 text-stone-400 text-[13px]">No data</p>
              ) : (
                <div className="space-y-4">
                  {monthlyByCategory.map(([cat, amt]) => {
                    const p = totalMonthlyOverhead ? Math.round((amt / totalMonthlyOverhead) * 100) : 0;
                    return <CategoryBar key={cat} label={cat} percent={p} amount={amt} />;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Expenses ─────────────────────────────────────────────── */}
      {activeTab === "standard" && (
        <div key="standard" className="fade-in bg-white rounded-xl border border-stone-200 overflow-hidden">
          <SectionHeader title="Standard Expenses">
            <SearchBar value={standardSearch} onChange={setStandardSearch} placeholder="Search expenses..." />
          </SectionHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {["Date", "Category", "Event / Client", "Hall", "Description", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {searchedStandardExpenses.length === 0 ? (
                  <EmptyRow colSpan={6} text="No standard expenses." />
                ) : (
                  searchedStandardExpenses.map((expense) => {
                    const linkedBooking = bookings.find((b) => b.id === expense.bookingId);
                    return (
                      <tr key={expense.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3.5 text-[12px] text-stone-400">
                          {new Date(expense.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] font-medium text-stone-500">{expense.category}</td>
                        <td className="px-5 py-3.5">
                          {linkedBooking ? (
                            <div>
                              <span className="text-[13px] font-medium text-stone-900 block">{linkedBooking.client}</span>
                              <span className="text-[11px] text-stone-400">{linkedBooking.event}</span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-stone-400 italic">General Overhead</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-stone-500">
                          {linkedBooking ? linkedBooking.hall : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-stone-500">{expense.label}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(expense.amount)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Daily Expenses ────────────────────────────────────────────────── */}
      {activeTab === "daily" && (
        <div key="daily" className="fade-in bg-white rounded-xl border border-stone-200 overflow-hidden">
          <SectionHeader title="Daily Expense Log" sub="Includes Pepsi / Coca-Cola crates & payments">
            <SearchBar value={dailySearch} onChange={setDailySearch} placeholder="Search expenses..." />
          </SectionHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {["Date", "Description", "Category", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {searchedDailyExpenses.length === 0 ? (
                  <EmptyRow colSpan={4} text="No daily expenses." />
                ) : (
                  searchedDailyExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5 text-[12px] text-stone-400">
                        {new Date(expense?.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{expense?.label}</td>
                      <td className="px-5 py-3.5 text-[11px] font-medium" style={{ color: GOLD }}>{expense?.category}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(expense?.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}