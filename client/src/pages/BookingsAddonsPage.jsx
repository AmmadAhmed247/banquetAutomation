import { useState, useMemo } from "react";
import {
  Sparkles, ChevronDown, ChevronRight, X, Calendar, Building, Wallet, TrendingUp, Inbox, PlusCircle, BarChart3, Layers, Zap, Trash2, Plus,
  ClipboardList,
  Receipt
} from "lucide-react";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";
import { getAllMonthlyExpenses, useCreateMonthlyExpense, useDeleteMonthlyExpense } from "../lib/hooks/monthlyExpense.hook";
import { getAllDailyExpenses, useCreateDailyExpense, useDeleteDailyExpense } from "../lib/hooks/dailyExpense.hook";

// ── helpers ──────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel"];

function currency(n) {
  return "₨ " + Number(n || 0).toLocaleString("en-PK");
}
function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function normalizeBooking(b) {
  return {
    id: b.id,
    hall: b.venue,
    client: b.client,
    event: b.event,
    date: b.date,
    revenue: Number(b.total_amount) || 0,
  };
}

function KpiCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500">
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
      <p className="text-[12px] text-stone-400 mt-1.5">{sub}</p>
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
  const { data: addons = [] } = getAllAddons();
  const { data: rawBookings = [] } = getAllBookings() || {};
  const bookings = useMemo(() => rawBookings.map(normalizeBooking), [rawBookings]);

  const { data: monthlyExpenses = [] } = getAllMonthlyExpenses();
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense();

  const {data: dailyExpenses = [] } = getAllDailyExpenses();
  const createDailyExpenseMutation = useCreateDailyExpense();
  const deleteDailyExpenseMutation = useDeleteDailyExpense();


  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [hallFilter, setHallFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("service");
  const [selectedStdExp, setSelectedStdExp] = useState(null);
  const [selectedDailyExp, setSelectedDailyExp] = useState(null);
  console.log(selectedDailyExp)

  const [addingMonthly, setAddingMonthly] = useState(false);
  const [newMonthly, setNewMonthly] = useState({
    category: MONTHLY_EXPENSE_CATEGORIES[0],
    label: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: CURRENT_YEAR,
  });

  // Add-ons grouped by booking
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
      return yearMatch && monthMatch && hallMatch && hasAddons;
    });
  }, [bookings, selectedYear, selectedMonth, hallFilter, addonsByBooking]);

  // Totals across the filtered set
  const totalClientRevenue = filteredBookings.reduce(
    (s, b) => s + (addonsByBooking[b.id] || []).reduce((a, x) => a + Number(x.client_price || 0), 0), 0
  );
  const totalVendorCost = filteredBookings.reduce(
    (s, b) => s + (addonsByBooking[b.id] || []).reduce((a, x) => a + Number(x.vendor_cost || 0), 0), 0
  );
  const totalCommission = totalClientRevenue - totalVendorCost;
  const margin = pct(totalCommission, totalClientRevenue);

  // ── Per-service breakdown ────────────────────────────────────────────────
  const serviceBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      const monthIdx = new Date(b.date).getMonth();
      (addonsByBooking[b.id] || []).forEach((item) => {
        if (!map[item.service]) {
          map[item.service] = {
            service: item.service,
            count: 0,
            revenue: 0,
            cost: 0,
            commission: 0,
            monthly: {},
          };
        }
        const s = map[item.service];
        const rev = Number(item.client_price || 0);
        const cost = Number(item.vendor_cost || 0);
        const comm = Number(item.commission ?? (rev - cost));

        s.count += 1;
        s.revenue += rev;
        s.cost += cost;
        s.commission += comm;

        if (!s.monthly[monthIdx]) s.monthly[monthIdx] = { revenue: 0, cost: 0, commission: 0, count: 0 };
        s.monthly[monthIdx].revenue += rev;
        s.monthly[monthIdx].cost += cost;
        s.monthly[monthIdx].commission += comm;
        s.monthly[monthIdx].count += 1;
      });
    });
    return Object.values(map).sort((a, b) => b.commission - a.commission);
  }, [filteredBookings, addonsByBooking]);

  const maxServiceCommission = Math.max(...serviceBreakdown.map((s) => s.commission), 1);

  // ── Monthly overhead breakdown ───────────────────────────────────────────
  // Uses the same year/month filters as the rest of the page. "All Months"
  // shows every entry for the selected year, grouped by month; picking a
  // specific month narrows to just that period's entries.
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

  const monthlyByCategory = useMemo(() => {
    const map = {};
    filteredMonthlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredMonthlyExpenses]);

  function addMonthlyExpense() {
    try {
      if (!newMonthly.label || !newMonthly.amount) return;
      const payload = {
        category: newMonthly.category,
        label: newMonthly.label,
        amount: Number(newMonthly.amount || 0),
        month: newMonthly.month,
        year: newMonthly.year,
      };
      createMonthlyExpenseMutation.mutate(payload);
      setNewMonthly({
        category: MONTHLY_EXPENSE_CATEGORIES[0],
        label: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: CURRENT_YEAR,
      });
      setAddingMonthly(false);
    } catch (error) {
      console.log(error);
    }
  }

  function deleteMonthlyExpense(id) {
    deleteMonthlyExpenseMutation.mutate(id);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-8 antialiased selection:bg-emerald-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Management Suite</span>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mt-1">
            Add-on Services & Commission
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Hall Filter */}
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

          {/* Year Filter */}
          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-[12px] font-medium text-stone-700 outline-none focus:border-green-400 cursor-pointer">
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          {/* Month Filter Pills */}
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

      {/* ── KPI Grid ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Client Revenue" value={currency(totalClientRevenue)} sub="Total charged for add-ons" icon={Wallet} />
        <KpiCard label="Vendor Cost" value={currency(totalVendorCost)} sub="Paid out to vendors" icon={Building} />
        <KpiCard label="Your Commission" value={currency(totalCommission)} sub={`${margin}% margin on add-ons`} icon={TrendingUp} />
        <KpiCard label="Active Bookings" value={filteredBookings.length} sub="With add-ons attached" icon={Sparkles} />
      </div>

      {/* ── Tab Switcher ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-lg border border-stone-200 w-max">
        <button
          onClick={() => setActiveTab("service")}
          className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all flex items-center gap-2
            ${activeTab === "service"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"}`}
        >
          <Layers size={14} className={activeTab === "service" ? "text-green-600" : "text-stone-400"} />
          Service Performance
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all flex items-center gap-2
            ${activeTab === "bookings"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"}`}
        >
          <PlusCircle size={14} className={activeTab === "bookings" ? "text-green-600" : "text-stone-400"} />
          Bookings with Add-ons
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all flex items-center gap-2
            ${activeTab === "monthly"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-800"}`}
        >
          <Zap size={14} className={activeTab === "monthly" ? "text-amber-600" : "text-stone-400"} />
          Monthly Expenses
        </button>
        <button
          onClick={() => setActiveTab("standard")}
          className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap
      ${activeTab === "standard" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
        >
          <ClipboardList size={14} className={activeTab === "standard" ? "text-blue-600" : "text-stone-400"} />
          Standard Expenses
        </button>
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all flex items-center gap-2 whitespace-nowrap
      ${activeTab === "daily" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
        >
          <Receipt size={14} className={activeTab === "daily" ? "text-indigo-600" : "text-stone-400"} />
          Daily Expenses
        </button>
      </div>

      {/* ── Service Performance ──────────────────────────────────────────────── */}
      {activeTab === "service" && (
        <div className={`grid gap-6 items-start mb-8 ${selectedService ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1"}`}>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900 flex items-center gap-2">
                  <Layers size={15} className="text-green-600" /> Service Performance
                </h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Profit and cost broken down per service — click a row for its monthly trend</p>
              </div>
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                {serviceBreakdown.length} services
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["Service", "Sold", "Client Revenue", "Vendor Cost", "Commission", "Margin", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {serviceBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-stone-400 text-[12px]">
                        No add-on services for these filters.
                      </td>
                    </tr>
                  )}
                  {serviceBreakdown.map((s) => {
                    const svcMargin = pct(s.commission, s.revenue);
                    const isSel = selectedService?.service === s.service;
                    return (
                      <tr key={s.service}
                        onClick={() => setSelectedService(isSel ? null : s)}
                        className={`cursor-pointer transition-colors duration-150 ${isSel ? "bg-green-50/50" : "hover:bg-stone-50"}`}>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900 flex items-center gap-2">
                          <PlusCircle size={12} className="text-green-600" /> {s.service}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-stone-500">{s.count}×</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(s.revenue)}</td>
                        <td className="px-5 py-3.5 text-[13px] text-rose-600">{currency(s.cost)}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-violet-700">+{currency(s.commission)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(0, svcMargin)}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-stone-500">{svcMargin}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <ChevronRight size={16} className={`text-stone-400 inline transition-transform ${isSel ? "rotate-90 text-violet-600" : ""}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Monthly Drawer */}
          {selectedService && (
            <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden sticky top-6">
              <div className="p-5 border-b border-stone-100 bg-stone-50/60 flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-100 flex items-center gap-1 w-max">
                    <BarChart3 size={10} /> Monthly Breakdown
                  </span>
                  <p className="text-[14px] font-semibold text-stone-900 mt-1.5">{selectedService.service}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Sold {selectedService.count}× · {currency(selectedService.commission)} total commission · {selectedYear}
                  </p>
                </div>
                <button onClick={() => setSelectedService(null)} className="text-stone-400 hover:text-stone-900 p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(100vh-260px)]">
                <div className="flex flex-col gap-3">
                  {MONTHS.map((m, idx) => {
                    const md = selectedService.monthly[idx];
                    if (!md) return null;
                    const mMargin = pct(md.commission, md.revenue);
                    return (
                      <div key={m} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900 text-[13px]">{m}</span>
                          <span className="text-[9px] font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                            {md.count} sold
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-stone-100 flex flex-col gap-1 text-[12px]">
                          <div className="flex justify-between text-stone-600">
                            <span>Revenue</span>
                            <span className="font-semibold text-stone-900">{currency(md.revenue)}</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>Vendor Cost</span>
                            <span className="font-semibold text-rose-600">{currency(md.cost)}</span>
                          </div>
                          <div className="flex justify-between text-stone-900 pt-1 border-t border-stone-100 font-bold">
                            <span>Commission</span>
                            <span className="text-violet-700">+{currency(md.commission)} </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(selectedService.monthly).length === 0 && (
                    <div className="text-center py-12">
                      <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                      <p className="text-stone-400 text-[12px]">No monthly data for this filter set.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table & Detail Drawer (per booking) ───────────────────────────────── */}
      {activeTab === "bookings" && (
        <div className={`grid gap-6 items-start ${selectedBooking ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1"}`}>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900">Bookings with Add-ons</h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Click a row to see every add-on item and its commission</p>
              </div>
              <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                {filteredBookings.length} bookings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["Client", "Hall", "Event", "Date", "Items", "Client Revenue", "Commission", ""].map((h) => (
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
                        No bookings with add-ons for these filters.
                      </td>
                    </tr>
                  )}
                  {filteredBookings.map((b) => {
                    const items = addonsByBooking[b.id] || [];
                    const rev = items.reduce((s, x) => s + Number(x.client_price || 0), 0);
                    const cost = items.reduce((s, x) => s + Number(x.vendor_cost || 0), 0);
                    const comm = rev - cost;
                    const isSel = selectedBooking?.id === b.id;

                    return (
                      <tr key={b.id}
                        onClick={() => setSelectedBooking(isSel ? null : b)}
                        className={`cursor-pointer transition-colors duration-150 ${isSel ? "bg-green-50/50" : "hover:bg-stone-50"}`}>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border
                            ${b.hall === "Hall A" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>
                            {b.hall}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                        <td className="px-5 py-3.5 text-[12px] text-stone-400">
                          {new Date(b.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                            <PlusCircle size={9} /> {items.length}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(rev)}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-violet-700">+{currency(comm)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <ChevronRight size={16} className={`text-stone-400 inline transition-transform ${isSel ? "rotate-90 text-violet-600" : ""}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Drawer */}
          {selectedBooking && (
            <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden sticky top-6">
              <div className="p-5 border-b border-stone-100 bg-stone-50/60 flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                    Add-on Breakdown
                  </span>
                  <p className="text-[14px] font-semibold text-stone-900 mt-1.5">{selectedBooking.client}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {selectedBooking.event} · {selectedBooking.hall} ·{" "}
                    {new Date(selectedBooking.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="text-stone-400 hover:text-stone-900 p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(100vh-260px)]">
                {(addonsByBooking[selectedBooking.id] || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                    <p className="text-stone-400 text-[12px]">No add-ons recorded for this booking.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(addonsByBooking[selectedBooking.id] || []).map((item) => (
                      <div key={item.id} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900 text-[13px] flex items-center gap-1.5">
                            <PlusCircle size={12} className="text-green-600" /> {item.service}
                          </span>
                          <span className="text-[9px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Add-on
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-lg border border-stone-100 flex flex-col gap-1 text-[12px]">
                          <div className="flex justify-between text-stone-600">
                            <span>Client Price</span>
                            <span className="font-semibold text-stone-900">{currency(item.client_price)}</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>Vendor Cost</span>
                            <span className="font-semibold text-rose-600">{currency(item.vendor_cost)}</span>
                          </div>
                          <div className="flex justify-between text-stone-900 pt-1 border-t border-stone-100 font-bold">
                            <span>Commission</span>
                            <span className="text-violet-700">+{currency(item.commission)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Monthly Expenses ─────────────────────────────────────────────────── */}
      {activeTab === "monthly" && (
        <div className="flex flex-col gap-6">

          {/* KPI + Add form */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
              <div>
                <p className="text-[13px] font-semibold text-stone-900 flex items-center gap-2">
                  <Zap size={14} className="text-amber-600" /> Monthly Overhead
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Electric bill, diesel — not tied to a specific booking · {currency(totalMonthlyOverhead)} for {selectedMonth === "all" ? selectedYear : `${selectedMonth} ${selectedYear}`}
                </p>
              </div>
              {!addingMonthly && (
                <button onClick={() => setAddingMonthly(true)}
                  className="text-[11px] font-medium px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors flex items-center gap-1.5">
                  <Plus size={12} /> Add Monthly Expense
                </button>
              )}
            </div>

            {addingMonthly && (
              <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-stone-100">
                <div className="grid grid-cols-2 gap-2">
                  <select value={newMonthly.month} onChange={(e) => setNewMonthly({ ...newMonthly, month: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500 bg-white text-stone-700">
                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                  </select>
                  <select value={newMonthly.year} onChange={(e) => setNewMonthly({ ...newMonthly, year: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500 bg-white text-stone-700">
                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <select value={newMonthly.category} onChange={(e) => setNewMonthly({ ...newMonthly, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500 bg-white text-stone-700">
                  {MONTHLY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input value={newMonthly.label} onChange={(e) => setNewMonthly({ ...newMonthly, label: e.target.value })}
                  placeholder="Line item description"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500 placeholder:text-stone-300" />
                <input type="number" value={newMonthly.amount} onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })}
                  placeholder="Amount (₨)"
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-amber-500 placeholder:text-stone-300" />
                <div className="flex gap-2 mt-1">
                  <button onClick={addMonthlyExpense}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-medium rounded-lg transition-colors">
                    Add Monthly Expense
                  </button>
                  <button onClick={() => setAddingMonthly(false)}
                    className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

            {/* Entries, grouped by month */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-stone-900">Logged Entries</h2>
                  <p className="text-[11px] text-stone-400 mt-0.5">{filteredMonthlyExpenses.length} entries for these filters</p>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  {currency(totalMonthlyOverhead)}
                </span>
              </div>

              <div className="px-6 py-4">
                {filteredMonthlyExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                    <p className="text-stone-400 text-[12px]">No monthly expenses logged for these filters.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
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
                              <span className="text-[11px] font-semibold text-stone-600">{currency(monthTotal)}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              {entries.map((e) => (
                                <div key={e.id} className="flex items-center gap-4 py-2.5 px-3 rounded-lg bg-stone-50 border border-stone-100 group">
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[13px] font-medium text-stone-800 truncate">{e.label}</span>
                                    <span className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase mt-0.5">{e.category}</span>
                                  </div>
                                  <span className="text-[13px] font-semibold text-stone-900 flex-shrink-0">{currency(e.amount)}</span>
                                  <button onClick={() => deleteMonthlyExpense(e.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-stone-300 hover:text-rose-600 rounded flex-shrink-0">
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

            {/* Category breakdown */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h2 className="text-[15px] font-semibold text-stone-900 mb-5">By Category</h2>
              {monthlyByCategory.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox size={24} className="text-stone-200 mx-auto mb-2" />
                  <p className="text-stone-400 text-[12px]">No data for these filters.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {monthlyByCategory.map(([cat, amt]) => {
                    const p = pct(amt, totalMonthlyOverhead);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[12px] font-medium text-stone-700">{cat}</span>
                          <span className="text-[11px] font-semibold text-amber-700">{p}%</span>
                        </div>
                        <div className="w-full h-[5px] bg-stone-100 rounded-full overflow-hidden">
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
      {/* ── Standard Expenses (Grouped by Category) ─────────────────────────── */}
      {activeTab === "standard" && (
        <div className={`grid gap-6 items-start ${selectedStdExp ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1"}`}>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900">Standard Expenses</h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Fixed recurring costs and operational overhead</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["Category", "Allocated To", "Frequency", "Amount", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Map through your standardExpenses here */}
                  <tr onClick={() => setSelectedStdExp({ name: 'Staff Salary' })} className="cursor-pointer hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">Staff Salaries</td>
                    <td className="px-5 py-3.5 text-[12px] text-stone-500">Hall A & B</td>
                    <td className="px-5 py-3.5"><span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Monthly</span></td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(450000)}</td>
                    <td className="px-5 py-3.5 text-right"><ChevronRight size={16} className="text-stone-400 inline" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {selectedStdExp && (
            <DetailSidebar title="Expense History" subtitle={selectedStdExp.name} onClose={() => setSelectedStdExp(null)}>
              {/* History content goes here */}
              <p className="text-stone-400 text-[12px]">View history of {selectedStdExp.name} payments...</p>
            </DetailSidebar>
          )}
        </div>
      )}

      {/* ── Daily Expenses (Log Format) ────────────────────────────────────── */}
      {activeTab === "daily" && (
        <div className={`grid gap-6 items-start ${selectedDailyExp ? "lg:grid-cols-[1fr_380px]" : "lg:grid-cols-1"}`}>
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-stone-900">Daily Expense Log</h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Petty cash and small daily operational spends</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {["Date", "Description", "Category", "Amount", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Map through your dailyExpenses here */}
                  {dailyExpenses.map((expense) => {
                    return (
                      <tr className="hover:bg-stone-50 cursor-pointer" onClick={() => setSelectedDailyExp(expense)}>
                        <td className="px-5 py-3.5 text-[12px] text-stone-400">{expense?.date}</td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{expense?.label}</td>
                        <td className="px-5 py-3.5 text-[11px] text-indigo-600 font-semibold uppercase">{expense?.category}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{expense?.amount}</td>
                        <td className="px-5 py-3.5 text-right"><ChevronRight size={16} className="text-stone-400 inline" /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {selectedDailyExp && (
            <DetailSidebar title="Receipt Details" subtitle={`Transaction #${selectedDailyExp?.id}`} onClose={() => setSelectedDailyExp(null)}>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase">Paid To</span>
                <p className="text-[13px] font-semibold text-stone-900">Local Vendor</p>
                <div className="mt-3 pt-3 border-t border-stone-200">
                  <p className="text-[11px] text-stone-500 italic">{selectedDailyExp?.label}</p>
                </div>
              </div>
            </DetailSidebar>
          )}
        </div>
      )}
    </div>
  );
}