import { useState, useMemo } from "react";
import {
  TrendingUp, Plus, Trash2, Receipt,
  ChevronDown, BarChart3, DollarSign,
  SlidersHorizontal, X, ArrowUpRight, Inbox, Calendar,
  PlusCircle
} from "lucide-react";
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllExpenses, useCreateExpense, useDeleteExpense } from "../lib/hooks/expense.hook";
import { getAllAddons, useCreateAddon, useDeleteAddon } from "../lib/hooks/addon.hook";
import { 
  getAllMonthlyExpenses, 
  useCreateMonthlyExpense, 
  useDeleteMonthlyExpense 
} from "../lib/hooks/monthlyExpense.hook"; // Added missing hooks



// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STANDARD_EXPENSE_CATEGORIES = ["Staff Wages", "Miscellaneous"];

const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel"];

const ADDON_CATEGORIES = [
  "Pepsi Co.",
  "Coca Cola Co.",
  "Fresh Flower",
  "Cola Next",
  "Dance Floor",
  "Water Bottles",
  "Ayaz Tissue",
  "Stage",
  "Fire Crackers",
  "Ladies Staff",
  "Miscellaneous",

];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];

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
function KpiCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-400">
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[12px] text-stone-400">{sub}</p>
          {trend !== undefined && (
            <span
              className={`text-[11px] font-semibold tracking-tight px-1.5 py-0.5 rounded flex items-center gap-0.5 ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
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

function AddonRow({ addon, onDelete }) {
  const commission = Number(addon.client_price || 0) - Number(addon.vendor_cost || 0);
  return (
    <div className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0 group">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] font-medium text-stone-800 truncate flex items-center gap-1.5">
          <PlusCircle size={12} className="text-violet-600 flex-shrink-0" />
          {addon.service}
        </span>
        <div className="text-[11px] text-stone-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>Client: {currency(addon.client_price)}</span>
          <span>Vendor: {currency(addon.vendor_cost)}</span>
          <span className="text-violet-700 font-semibold">Commission: +{currency(commission)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[13px] text-stone-900 font-semibold">{currency(addon.client_price)}</span>
        <button onClick={() => onDelete(addon.id)}
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
  const { data: expenses = [] } = getAllExpenses();
  const { data: addons = [] } = getAllAddons();
  const { data: allMonthlyExpenses = [] } = getAllMonthlyExpenses(); // Logic Fix 1: Fetch monthly overheads

  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const createAddonMutation = useCreateAddon();
  const deleteAddonMutation = useDeleteAddon();
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense(); // Logic Fix 2: Delete handler

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [hallFilter, setHallFilter] = useState("all");


  const [addingMonthly, setAddingMonthly] = useState(false);
  const [newMonthly, setNewMonthly] = useState({
    category: MONTHLY_EXPENSE_CATEGORIES[0],
    label: "",
    amount: "",
    month: new Date().getMonth() + 1, // 1-12, defaults to current month
    year: new Date().getFullYear(),
  });

  const { data: rawBookings = [] } = getAllBookings() || {};
  const bookings = useMemo(() => rawBookings.map(normalizeBooking), [rawBookings]);

  const [mode, setMode] = useState("expense");
  const [newExp, setNewExp] = useState({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
  const [newAddon, setNewAddon] = useState({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "" });
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

  const addonsByBooking = useMemo(() => {
    const map = {};
    addons.forEach((a) => {
      if (!map[a.bookingId]) map[a.bookingId] = [];
      map[a.bookingId].push(a);
    });
    return map;
  }, [addons]);

  // Combined economics — including add-ons in main totals
  const totalRevenue = useMemo(() => {
    const bookingRev = filteredBookings.reduce((s, b) => s + b.revenue, 0);
    const addonRev = filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => acc + Number(a.client_price || 0), 0);
    }, 0);
    return bookingRev + addonRev;
  }, [filteredBookings, addonsByBooking]);

  const totalExpense = useMemo(() => {
    const stdExp = filteredBookings.reduce((s, b) => {
      return s + (expensesByBooking[b.id] || []).reduce((acc, e) => acc + Number(e.amount || 0), 0);
    }, 0);
    const vendorExp = filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => acc + Number(a.vendor_cost || 0), 0);
    }, 0);

    // Logic Fix 3: Include monthly overhead in the KPI cards
    const monthlyOverhead = allMonthlyExpenses
      .filter(me => {
        const yMatch = me.year === selectedYear;
        const mMatch = selectedMonth === null || (me.month - 1) === selectedMonth;
        return yMatch && mMatch;
      })
      .reduce((s, me) => s + Number(me.amount || 0), 0);

    return stdExp + vendorExp + monthlyOverhead;
  }, [filteredBookings, expensesByBooking, addonsByBooking, allMonthlyExpenses, selectedYear, selectedMonth]);

  const totalProfit = totalRevenue - totalExpense;
  const margin = pct(totalProfit, totalRevenue);

  const totalAddonCommission = useMemo(() => {
    return filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => {
        return acc + (Number(a.client_price || 0) - Number(a.vendor_cost || 0));
      }, 0);
    }, 0);
  }, [filteredBookings, addonsByBooking]);

  const monthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const bks = bookings.filter((b) => {
        const d = new Date(b.date);
        return d.getFullYear() === selectedYear && d.getMonth() === idx &&
          (hallFilter === "all" || b.hall === hallFilter);
      });

      const rev = bks.reduce((s, b) => {
        const bAddonRev = (addonsByBooking[b.id] || []).reduce((acc, a) => acc + Number(a.client_price || 0), 0);
        return s + b.revenue + bAddonRev;
      }, 0);

      const bookingExp = bks.reduce((s, b) => {
        const bStdExp = (expensesByBooking[b.id] || []).reduce((a, e) => a + Number(e.amount || 0), 0);
        const bVendorExp = (addonsByBooking[b.id] || []).reduce((a, ad) => a + Number(ad.vendor_cost || 0), 0);
        return s + bStdExp + bVendorExp;
      }, 0);

      // Logic Fix 4: Include overhead in the Chart line
      const monthlyOverhead = allMonthlyExpenses
        .filter(me => me.year === selectedYear && (me.month - 1) === idx)
        .reduce((s, me) => s + Number(me.amount || 0), 0);

      const exp = bookingExp + monthlyOverhead;

      return { month: m, Revenue: rev, Expenses: exp, profit: rev - exp, bookings: bks.length };
    });
  }, [bookings, selectedYear, hallFilter, expensesByBooking, addonsByBooking, allMonthlyExpenses]);

  const hallMonthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const forHall = (hall) =>
        bookings
          .filter((b) => {
            const d = new Date(b.date);
            return d.getFullYear() === selectedYear && d.getMonth() === idx && b.hall === hall;
          })
          .reduce((s, b) => {
            const bAddonRev = (addonsByBooking[b.id] || []).reduce((acc, a) => acc + Number(a.client_price || 0), 0);
            return s + b.revenue + bAddonRev;
          }, 0);
      return { month: m, "Hall A": forHall("Hall A"), "Hall B": forHall("Hall B") };
    });
  }, [bookings, selectedYear, addonsByBooking]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      // Std expenses
      (expensesByBooking[b.id] || []).forEach((e) => {
        const val = Number(e.amount || 0);
        map[e.category] = (map[e.category] || 0) + val;
      });
      // Vendor costs as a category
      (addonsByBooking[b.id] || []).forEach((a) => {
        const val = Number(a.vendor_cost || 0);
        map["Vendor Payouts"] = (map["Vendor Payouts"] || 0) + val;
      });
    });

    // Logic Fix 5: Include overheads in the breakdown list
    allMonthlyExpenses
      .filter(me => {
        const yMatch = me.year === selectedYear;
        const mMatch = selectedMonth === null || (me.month - 1) === selectedMonth;
        return yMatch && mMatch;
      })
      .forEach(me => {
        map[me.category] = (map[me.category] || 0) + Number(me.amount || 0);
      });

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings, expensesByBooking, addonsByBooking, allMonthlyExpenses, selectedYear, selectedMonth]);

  const upcomingEvents = useMemo(() => {
    return [...bookings]
      .filter((b) => daysUntil(b.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [bookings]);

  // ── actions ──────────────────────────────────────────────────────────────────
  function addExpense(bookingId) {
    try {
      if (!newExp.label || !newExp.amount) return;
      const payload = {
        bookingId,
        category: newExp.category,
        label: newExp.label,
        amount: Number(newExp.amount || 0),
      };
      createExpenseMutation.mutate(payload);
      setNewExp({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
      setAddingTo(null);
    } catch (error) {
      console.log(error);
    }
  }

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
        year: new Date().getFullYear(),
      });
      setAddingMonthly(false);
    } catch (error) {
      console.log(error);
    }
  }
  function addAddon(bookingId) {
    try {
      if (!newAddon.service || !newAddon.client_price) return;
      const payload = {
        bookingId,
        service: newAddon.service,
        client_price: Number(newAddon.client_price || 0),
        vendor_cost: Number(newAddon.vendor_cost || 0),
      };
      createAddonMutation.mutate(payload);
      setNewAddon({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "" });
      setAddingTo(null);
    } catch (error) {
      console.log(error);
    }
  }

  function deleteExpense(id) {
    deleteExpenseMutation.mutate(id);
  }

  function deleteAddon(id) {
    deleteAddonMutation.mutate(id);
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedBookingExpenses = selectedBookingId ? (expensesByBooking[selectedBookingId] || []) : [];
  const selectedBookingAddons = selectedBookingId ? (addonsByBooking[selectedBookingId] || []) : [];

  // Logic for selected booking totals
  const selectedBookingBaseRev = selectedBooking?.revenue || 0;
  const selectedBookingAddonRev = selectedBookingAddons.reduce((s, a) => s + Number(a.client_price || 0), 0);
  const selectedBookingGrossRev = selectedBookingBaseRev + selectedBookingAddonRev;

  const selectedBookingStdExp = selectedBookingExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const selectedBookingVendorExp = selectedBookingAddons.reduce((s, a) => s + Number(a.vendor_cost || 0), 0);
  const selectedBookingGrossExp = selectedBookingStdExp + selectedBookingVendorExp;

  const selectedBookingNetProfit = selectedBookingGrossRev - selectedBookingGrossExp;
  const selectedBookingAddonCommission = selectedBookingAddons.reduce(
    (s, a) => s + (Number(a.client_price || 0) - Number(a.vendor_cost || 0)), 0
  );

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
        <KpiCard label="Gross Revenue" value={currency(totalRevenue)} sub={`Incl. ${currency(totalRevenue - (filteredBookings.reduce((s, b) => s + b.revenue, 0)))} add-ons`} icon={ArrowUpRight} />
        <KpiCard label="Total Costs" value={currency(totalExpense)} sub="Std expenses + Vendor payouts" icon={Receipt} />
        <KpiCard label="Net Profit" value={currency(totalProfit)} sub={totalProfit >= 0 ? "Total take-home" : "Running at a loss"} icon={DollarSign} trend={margin} />
        <KpiCard label="Add-on Commission" value={currency(totalAddonCommission)} sub="Pure profit from services" icon={PlusCircle} />
      </div>

      {/* ── Trend + Activity ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-stone-900">Revenue vs Expenses</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {currency(totalRevenue)} total gross against {currency(totalExpense)} in total costs · {selectedYear}
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
              <p className="text-[11px] text-stone-400 mt-0.5">Gross monthly revenue, Hall A vs Hall B · {selectedYear}</p>
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
              <p className="text-[11px] text-stone-400 mt-0.5">Select a row to inspect gross costs and add-ons</p>
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
                  const bAddons = addonsByBooking[b.id] || [];
                  const bExpenses = expensesByBooking[b.id] || [];

                  const bAddonRev = bAddons.reduce((s, a) => s + Number(a.client_price || 0), 0);
                  const bVendorExp = bAddons.reduce((s, a) => s + Number(a.vendor_cost || 0), 0);
                  const bStdExp = bExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

                  const bTotalRev = b.revenue + bAddonRev;
                  const bTotalExp = bStdExp + bVendorExp;
                  const bPro = bTotalRev - bTotalExp;

                  const isSel = selectedBookingId === b.id;
                  const addonCount = bAddons.length;

                  return (
                    <tr key={b.id}
                      onClick={() => setSelectedBookingId(isSel ? null : b.id)}
                      className={`cursor-pointer transition-colors duration-150 ${isSel ? "bg-emerald-50/50" : "hover:bg-stone-50"}`}>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">
                        {b.client}
                        {addonCount > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                            <PlusCircle size={9} /> {addonCount}
                          </span>
                        )}
                      </td>
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
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(bTotalRev)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-rose-600">{currency(bTotalExp)}</td>
                      <td className={`px-5 py-3.5 text-[13px] font-semibold ${bPro >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {bPro >= 0 ? "+" : ""}{currency(bPro)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingTo(b.id); setSelectedBookingId(b.id); }}
                          className="text-[11px] font-medium px-2.5 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors">
                          + Add
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

          <div className="bg-white rounded-xl  border-stone-200 p-5 mb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[13px] font-semibold text-stone-900">Monthly Overhead</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Electric bill, diesel, etc</p>
              </div>
              {!addingMonthly && (
                <button onClick={() => setAddingMonthly(true)}
                  className="text-[11px] font-medium px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors">
                  + Add Monthly Expense
                </button>
              )}
            </div>

            {/* Logic Fix 6: Show the list of overheads so you can see/delete what you add */}
            <div className="space-y-2 mb-4">
              {allMonthlyExpenses
                .filter(me => me.year === selectedYear && (selectedMonth === null || (me.month - 1) === selectedMonth))
                .map(me => (
                  <div key={me.id} className="flex justify-between items-center bg-stone-50 p-2 rounded border border-stone-100 group">
                    <div>
                      <p className="text-[12px] font-medium text-stone-800">{me.label}</p>
                      <p className="text-[10px] text-stone-400">{me.category} • {MONTHS[me.month - 1]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold">{currency(me.amount)}</span>
                      <button onClick={() => deleteMonthlyExpenseMutation.mutate(me.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-600 transition-all"><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
            </div>

            {addingMonthly && (
              <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
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

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { label: "Gross Revenue", value: currency(selectedBookingGrossRev), cls: "text-stone-800" },
                    { label: "Total Costs", value: currency(selectedBookingGrossExp), cls: "text-rose-600" },
                    { label: "Net Profit", value: currency(selectedBookingNetProfit), cls: selectedBookingNetProfit >= 0 ? "text-emerald-700" : "text-rose-600" },
                    { label: "Commission", value: currency(selectedBookingAddonCommission), cls: "text-violet-700" },
                  ].map((k) => (
                    <div key={k.label} className="bg-white rounded-lg p-2.5 border border-stone-100">
                      <p className="text-[9px] text-stone-400 uppercase tracking-tight mb-1">{k.label}</p>
                      <p className={`text-[12px] font-semibold ${k.cls}`}>{k.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-2 max-h-72">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 pt-3 pb-1">Standard Expenses</p>
                {selectedBookingExpenses.length === 0 ? (
                  <p className="text-[12px] text-stone-400 text-center py-4">No costs logged for this booking.</p>
                ) : (
                  selectedBookingExpenses.map((e) => (
                    <ExpenseRow key={e.id} expense={e} onDelete={deleteExpense} />
                  ))
                )}

                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 pt-4 pb-1">Add-on Services</p>
                {selectedBookingAddons.length === 0 ? (
                  <p className="text-[12px] text-stone-400 text-center py-4">No add-ons logged for this booking.</p>
                ) : (
                  selectedBookingAddons.map((a) => (
                    <AddonRow key={a.id} addon={a} onDelete={deleteAddon} />
                  ))
                )}
              </div>

              <div className="border-t border-stone-100 p-4 bg-stone-50/40">
                {addingTo === selectedBookingId ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-stone-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setMode("expense")}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${mode === "expense" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("addon")}
                        className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${mode === "addon" ? "bg-violet-600 text-white shadow-sm" : "text-stone-500"}`}>
                        Add-on
                      </button>
                    </div>

                    {mode === "expense" ? (
                      <>
                        <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white text-stone-700">
                          {STANDARD_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
                      </>
                    ) : (
                      <>
                        <select value={newAddon.service} onChange={(e) => setNewAddon({ ...newAddon, service: e.target.value })}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 bg-white text-stone-700">
                          {ADDON_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={newAddon.client_price} onChange={(e) => setNewAddon({ ...newAddon, client_price: e.target.value })}
                            placeholder="Client Price (₨)"
                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 placeholder:text-stone-300" />
                          <input type="number" value={newAddon.vendor_cost} onChange={(e) => setNewAddon({ ...newAddon, vendor_cost: e.target.value })}
                            placeholder="Vendor Cost (₨)"
                            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 placeholder:text-stone-300" />
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => addAddon(selectedBookingId)}
                            className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-medium rounded-lg transition-colors">
                            Add Add-on
                          </button>
                          <button onClick={() => setAddingTo(null)}
                            className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] font-medium rounded-lg hover:bg-stone-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(selectedBookingId)}
                    className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-[12px] font-medium text-stone-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-white transition-all flex items-center justify-center gap-1.5">
                    <Plus size={13} /> Add Line Cost / Add-on
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