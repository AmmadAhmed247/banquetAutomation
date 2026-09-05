import { useState, useMemo } from "react";
import {
  Sparkles, ChevronDown, ChevronRight, X, Building, Wallet, TrendingUp, Inbox, PlusCircle, Layers, Zap, Trash2, Plus, Loader2,
  ClipboardList, Receipt, Search
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";
import { getAllMonthlyExpenses, useCreateMonthlyExpense, useDeleteMonthlyExpense } from "../lib/hooks/monthlyExpense.hook";
import { getAllDailyExpenses } from "../lib/hooks/dailyExpense.hook";
import { getAllExpenses } from "../lib/hooks/expense.hook";

// ── helpers ──────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel"];

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

// Color palette for services
const SERVICE_COLORS = {
  "Pepsi Co.": "#ef4444",
  "Coca Cola Co.": "#dc2626",
  "Fresh Flower": "#ec4899",
  "Cola Next": "#f97316",
  "Dance Floor": "#8b5cf6",
  "Water Bottles": "#0ea5e9",
  "Ayaz Tissue": "#14b8a6",
  "Stage": "#6366f1",
  "Fire Crackers": "#f59e0b",
  "Ladies Staff": "#d946ef",
  "Miscellaneous": "#64748b",
  "BBQ": "#b45309",
  "Sound System": "#3b82f6",
  "Entry": "#10b981",
  "Decoration": "#a855f7",
};

const FALLBACK_COLORS = [
  "#7c3aed", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1"
];

function getServiceColor(serviceName, index = 0) {
  return SERVICE_COLORS[serviceName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function KpiCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500">
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-xl font-semibold tracking-tight text-stone-900">{value}</p>
      <p className="text-[12px] text-stone-400 mt-1">{sub}</p>
    </div>
  );
}

function DetailSidebar({ title, subtitle, children, onClose }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden sticky top-6">
      <div className="p-5 border-b border-stone-100 bg-stone-50/60 flex items-start justify-between">
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-wider bg-stone-200 text-stone-600 px-2 py-0.5 rounded border border-stone-300">
            {title}
          </span>
          <p className="text-[14px] font-semibold text-stone-900 mt-1.5">{subtitle}</p>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-900 p-1">
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
    addonsQuery,
    bookingsQuery,
    monthlyExpensesQuery,
    dailyExpensesQuery,
    expensesQuery,
  ].some((query) => query.isLoading);

  const bookings = useMemo(() => rawBookings.map(normalizeBooking), [rawBookings]);
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [hallFilter, setHallFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("service");
  const [searchQuery, setSearchQuery] = useState("");

  const [addingMonthly, setAddingMonthly] = useState(false);
  const [newMonthly, setNewMonthly] = useState({
    category: MONTHLY_EXPENSE_CATEGORIES[0],
    label: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: CURRENT_YEAR,
  });

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

      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        b.client?.toLowerCase().includes(q) ||
        b.event?.toLowerCase().includes(q) ||
        b.hall?.toLowerCase().includes(q) ||
        String(b.r_no || "").toLowerCase().includes(q.replace(/^r\.?\s*n(?:o\.?|umber)?\s*[:#-]?\s*/i, "").replace(/^#/, "")) ||
        (addonsByBooking[b.id] || []).some((a) => a.service?.toLowerCase().includes(q));

      return yearMatch && monthMatch && hallMatch && hasAddons && searchMatch;
    });
  }, [bookings, selectedYear, selectedMonth, hallFilter, addonsByBooking, searchQuery]);

  const totalClientRevenue = filteredBookings.reduce(
    (s, b) => s + (addonsByBooking[b.id] || []).reduce((a, x) => a + Number(x.client_price || 0), 0),
    0
  );
  const totalVendorCost = filteredBookings.reduce(
    (s, b) => s + (addonsByBooking[b.id] || []).reduce((a, x) => a + Number(x.vendor_cost || 0), 0),
    0
  );
  const totalCommission = totalClientRevenue - totalVendorCost;

  const serviceBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      (addonsByBooking[b.id] || []).forEach((item) => {
        if (!map[item.service]) {
          map[item.service] = {
            service: item.service,
            count: 0,
            revenue: 0,
            cost: 0,
            commission: 0,
          };
        }
        const s = map[item.service];
        const rev = Number(item.client_price || 0);
        const cost = Number(item.vendor_cost || 0);
        s.count += 1;
        s.revenue += rev;
        s.cost += cost;
        s.commission += rev - cost;
      });
    });
    return Object.values(map).sort((a, b) => b.commission - a.commission);
  }, [filteredBookings, addonsByBooking]);

  const chartData = serviceBreakdown.map((s) => ({
    service: s.service.length > 18 ? s.service.slice(0, 16) + "…" : s.service,
    fullName: s.service,
    commission: s.commission,
    revenue: s.revenue,
    count: s.count,
  }));

  const filteredStandardExpenses = useMemo(() => {
    return standardExpenses.filter((e) => {
      if (!e.created_at) return false;
      const d = new Date(e.created_at);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === "all" || d.getMonth() === MONTHS.indexOf(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [standardExpenses, selectedYear, selectedMonth]);

  const filteredMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.filter((e) => {
      const yearMatch = e.year === selectedYear;
      const monthMatch = selectedMonth === "all" || e.month === MONTHS.indexOf(selectedMonth) + 1;
      return yearMatch && monthMatch;
    });
  }, [monthlyExpenses, selectedYear, selectedMonth]);

  const totalMonthlyOverhead = filteredMonthlyExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const monthlyExpensesByMonth = useMemo(() => {
    const map = {};
    filteredMonthlyExpenses.forEach((e) => {
      if (!map[e.month]) map[e.month] = [];
      map[e.month].push(e);
    });
    return map;
  }, [filteredMonthlyExpenses]);

  const filteredDailyExpenses = useMemo(() => {
    return dailyExpenses.filter((e) => {
      const d = new Date(e.date);
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === "all" || d.getMonth() === MONTHS.indexOf(selectedMonth);
      return yearMatch && monthMatch;
    });
  }, [dailyExpenses, selectedYear, selectedMonth]);

  const monthlyByCategory = useMemo(() => {
    const map = {};
    filteredMonthlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredMonthlyExpenses]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 size={32} className="animate-spin text-green-600" />
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
      `}</style>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Management Suite</span>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mt-1">
            Add-on Services & Commission
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200">
            {["all", "Hall A", "Hall B"].map((h) => (
              <button
                key={h}
                onClick={() => setHallFilter(h)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all
                  ${hallFilter === h
                    ? "bg-white text-stone-900 shadow-sm font-semibold"
                    : "text-stone-500 hover:text-stone-800"}`}
              >
                {h === "all" ? "Both Halls" : h}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-[12px] font-medium text-stone-700 outline-none focus:border-green-400 cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedMonth("all")}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap
                ${selectedMonth === "all"
                  ? "bg-stone-900 text-white shadow-sm font-semibold"
                  : "text-stone-500 hover:text-stone-800"}`}
            >
              All Months
            </button>
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap
                  ${selectedMonth === m
                    ? "bg-stone-900 text-white shadow-sm font-semibold"
                    : "text-stone-500 hover:text-stone-800"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Client Revenue" value={currency(totalClientRevenue)} sub="Total charged for add-ons" icon={Wallet} />
        <KpiCard label="Vendor Cost" value={currency(totalVendorCost)} sub="Paid out to vendors" icon={Building} />
        <KpiCard label="Your Commission" value={currency(totalCommission)} sub="Net from add-ons" icon={TrendingUp} />
        <KpiCard label="Active Bookings" value={filteredBookings.length} sub="With add-ons attached" icon={Sparkles} />
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg border border-stone-200 overflow-x-auto max-w-full">
        {[
          { id: "service", label: "Service Performance", icon: Layers, color: "text-green-600" },
          { id: "bookings", label: "Bookings with Add-ons", icon: PlusCircle, color: "text-green-600" },
          { id: "monthly", label: "Monthly Expenses", icon: Zap, color: "text-amber-600" },
          { id: "standard", label: "Standard Expenses", icon: ClipboardList, color: "text-blue-600" },
          { id: "daily", label: "Daily Expenses", icon: Receipt, color: "text-indigo-600" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0
              ${activeTab === tab.id
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"}`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? tab.color : "text-stone-400"} />
            {tab.label}
          </button>
        ))}
      </div>

     {activeTab === "service" && (
  <div className="grid lg:grid-cols-5 gap-6">
    {/* Table */}
    <div className="lg:col-span-3 bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-stone-900 flex items-center gap-2">
            <Layers size={15} className="text-green-600" /> Service Performance
          </h2>
          <p className="text-[11px] text-stone-400 mt-0.5">Clean numbers — no deep dive</p>
        </div>
        <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
          {serviceBreakdown.length} services
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              {["Service", "Sold", "Revenue", "Cost", "Commission"].map((h) => (
                <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {serviceBreakdown.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-stone-400 text-[13px]">
                  <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
                  No add-on services for these filters.
                </td>
              </tr>
            ) : (
              serviceBreakdown.map((s) => (
                <tr key={s.service} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{s.service}</td>
                  <td className="px-5 py-3.5 text-[12px] text-stone-500">{s.count}×</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(s.revenue)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-rose-600">{currency(s.cost)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-violet-700">+{currency(s.commission)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modern Donut Chart Card */}
    <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-[15px] font-semibold text-stone-900">Commission Share</h2>
        <p className="text-[11px] text-stone-400 mt-0.5">Top performing services by commission earned</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-stone-400 text-[13px] min-h-[260px]">
          <div className="text-center">
            <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
            No data to display
          </div>
        </div>
      ) : (
        <>
          <div className="h-[200px] w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="commission"
                  nameKey="fullName"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getServiceColor(entry.fullName, index)}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;

                    const data = payload[0].payload;
                    const total = chartData.reduce((sum, d) => sum + d.commission, 0);
                    const pct = total ? Math.round((data.commission / total) * 100) : 0;

                    return (
                      <div className="relative z-50 bg-white border border-stone-200 rounded-xl shadow-xl px-4 py-3 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getServiceColor(data.fullName) }}
                          />
                          <p className="font-semibold text-stone-900 text-[13px]">
                            {data.fullName}
                          </p>
                        </div>
                        <div className="space-y-1 text-[12px]">
                          <div className="flex justify-between items-center">
                            <span className="text-stone-500">Commission</span>
                            <span className="font-semibold text-violet-700">
                              {currency(data.commission)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-stone-500">Share</span>
                            <span className="font-medium text-stone-800">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend list */}
          <div className="space-y-1.5 mt-2 max-h-[130px] overflow-y-auto pr-1">
            {chartData.map((item, idx) => {
              const total = chartData.reduce((sum, d) => sum + d.commission, 0);
              const pct = total ? Math.round((item.commission / total) * 100) : 0;
              return (
                <div key={item.fullName} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getServiceColor(item.fullName, idx) }}
                    />
                    <span className="text-stone-700 truncate font-medium">{item.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 font-medium">
                    <span className="text-stone-400">{pct}%</span>
                    <span className="text-stone-900">{currency(item.commission)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  </div>
)}

      {/* ── Bookings with Add-ons ─────────────────────────────────────────── */}
      {activeTab === "bookings" && (
        <div className={`grid gap-6 items-start ${selectedBooking ? "lg:grid-cols-[1fr_360px]" : ""}`}>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900">Bookings with Add-ons</h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Click a row for item details</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client, event, service..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-[13px] outline-none focus:border-green-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["R.No", "Client", "Hall", "Event", "Date", "Items", "Revenue", "Commission", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-stone-400 text-[13px]">
                        <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
                        No bookings match your filters / search.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const items = addonsByBooking[b.id] || [];
                      const rev = items.reduce((s, x) => s + Number(x.client_price || 0), 0);
                      const cost = items.reduce((s, x) => s + Number(x.vendor_cost || 0), 0);
                      const comm = rev - cost;
                      const isSel = selectedBooking?.id === b.id;

                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBooking(isSel ? null : b)}
                          className={`cursor-pointer transition-colors ${isSel ? "bg-green-50/60" : "hover:bg-stone-50"}`}
                        >
                          <td className="px-5 py-3.5 text-[12px] font-mono font-medium text-stone-600">
                            {b.r_no ? `#${b.r_no}` : `#${b.id}`}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border
                              ${b.hall === "Hall A"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-teal-50 text-teal-700 border-teal-100"}`}
                            >
                              {b.hall}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                          <td className="px-5 py-3.5 text-[12px] text-stone-400">
                            {new Date(b.date).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              {items.length}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(rev)}</td>
                          <td className="px-5 py-3.5 text-[13px] font-semibold text-violet-700">+{currency(comm)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <ChevronRight
                              size={16}
                              className={`text-stone-400 inline transition-transform ${isSel ? "rotate-90 text-violet-600" : ""}`}
                            />
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
              title="Add-on Breakdown"
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
                {(addonsByBooking[selectedBooking.id] || []).map((item) => (
                  <div key={item.id} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-stone-900 text-[13px]">{item.service}</span>
                      <span className="text-[9px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Add-on
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-stone-100 text-[12px] space-y-1">
                      <div className="flex justify-between text-stone-600">
                        <span>Detail</span>
                        <span className="font-medium text-stone-900">{item.description || "—"}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Client Price</span>
                        <span className="font-semibold">{currency(item.client_price)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Vendor Cost</span>
                        <span className="font-semibold text-rose-600">{currency(item.vendor_cost)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-stone-100 font-bold">
                        <span>Commission</span>
                        <span className="text-violet-700">
                          +{currency(item.commission ?? Number(item.client_price) - Number(item.vendor_cost))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSidebar>
          )}
        </div>
      )}

      {/* ── Monthly Expenses ──────────────────────────────────────────────── */}
      {activeTab === "monthly" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-[13px] font-semibold text-stone-900 flex items-center gap-2">
                  <Zap size={14} className="text-amber-600" /> Monthly Overhead
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {currency(totalMonthlyOverhead)} ·{" "}
                  {selectedMonth === "all" ? selectedYear : `${selectedMonth} ${selectedYear}`}
                </p>
              </div>
              {!addingMonthly && (
                <button
                  onClick={() => setAddingMonthly(true)}
                  className="text-[11px] font-medium px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} /> Add Expense
                </button>
              )}
            </div>

            {addingMonthly && (
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-stone-100">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newMonthly.month}
                    onChange={(e) => setNewMonthly({ ...newMonthly, month: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newMonthly.year}
                    onChange={(e) => setNewMonthly({ ...newMonthly, year: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500"
                  >
                    {YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={newMonthly.category}
                  onChange={(e) => setNewMonthly({ ...newMonthly, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500"
                >
                  {MONTHLY_EXPENSE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={newMonthly.label}
                  onChange={(e) => setNewMonthly({ ...newMonthly, label: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  value={newMonthly.amount}
                  onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })}
                  placeholder="Amount (₨)"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={addMonthlyExpense}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-medium rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingMonthly(false)}
                    className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-stone-900">Logged Entries</h2>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  {currency(totalMonthlyOverhead)}
                </span>
              </div>
              <div className="px-5 py-4">
                {filteredMonthlyExpenses.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-[13px]">
                    <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
                    No monthly expenses for these filters.
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
                              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                                {MONTHS[Number(monthNum) - 1]} {selectedYear}
                              </p>
                              <span className="text-[11px] font-semibold text-stone-600">
                                {currency(monthTotal)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {entries.map((e) => (
                                <div
                                  key={e.id}
                                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-stone-50 border border-stone-100 group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[13px] font-medium text-stone-800 block truncate">
                                      {e.label}
                                    </span>
                                    <span className="text-[10px] font-semibold text-amber-600 uppercase">
                                      {e.category}
                                    </span>
                                  </div>
                                  <span className="text-[13px] font-semibold text-stone-900">
                                    {currency(e.amount)}
                                  </span>
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
              <h2 className="text-[15px] font-semibold text-stone-900 mb-4">By Category</h2>
              {monthlyByCategory.length === 0 ? (
                <p className="text-center py-10 text-stone-400 text-[13px]">No data</p>
              ) : (
                <div className="space-y-4">
                  {monthlyByCategory.map(([cat, amt]) => {
                    const p = totalMonthlyOverhead ? Math.round((amt / totalMonthlyOverhead) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] font-medium text-stone-700">{cat}</span>
                          <span className="text-[11px] font-semibold text-amber-700">{p}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p}%` }} />
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">{currency(amt)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Expenses ─────────────────────────────────────────────── */}
      {activeTab === "standard" && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {["Date", "Category", "Event / Client", "Hall", "Description", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStandardExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-stone-400 text-[13px]">
                      <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
                      No standard expenses for these filters.
                    </td>
                  </tr>
                ) : (
                  filteredStandardExpenses.map((expense) => {
                    const linkedBooking = bookings.find((b) => b.id === expense.bookingId);
                    return (
                      <tr key={expense.id} className="hover:bg-stone-50">
                        <td className="px-5 py-3.5 text-[12px] text-stone-400">
                          {new Date(expense.created_at).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-bold uppercase">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {linkedBooking ? (
                            <div>
                              <span className="text-[13px] font-medium text-stone-900 block">
                                {linkedBooking.client}
                              </span>
                              <span className="text-[11px] text-stone-400">{linkedBooking.event}</span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-stone-400 italic">General Overhead</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[10px] font-bold text-stone-500">
                          {linkedBooking ? linkedBooking.hall : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-stone-500">{expense.label}</td>
                        <td className="px-5 py-3.5 text-[13px] font-bold text-stone-800">
                          {currency(expense.amount)}
                        </td>
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
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-[15px] font-semibold text-stone-900">Daily Expense Log</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Petty cash and small daily spends</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {["Date", "Description", "Category", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDailyExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-stone-400 text-[13px]">
                      <Inbox size={28} className="mx-auto mb-2 text-stone-200" />
                      No daily expenses for these filters.
                    </td>
                  </tr>
                ) : (
                  filteredDailyExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5 text-[12px] text-stone-400">
                        {new Date(expense?.date).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">
                        {expense?.label}
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-indigo-600 font-semibold uppercase">
                        {expense?.category}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">
                        {currency(expense?.amount)}
                      </td>
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