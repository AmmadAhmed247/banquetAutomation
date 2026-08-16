import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, Plus, Trash2, Receipt,
  ChevronDown, BarChart3, DollarSign,
  SlidersHorizontal, X, ArrowUpRight, Inbox, Calendar,
  PlusCircle, FileText,
  Pencil
} from "lucide-react";
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllExpenses, useCreateExpense, useDeleteExpense } from "../lib/hooks/expense.hook";
import { getAllAddons, useCreateAddon, useDeleteAddon, useMarkAddonReceived, useUpdateAddon } from "../lib/hooks/addon.hook";
import { 
  getAllMonthlyExpenses, 
  useCreateMonthlyExpense, 
  useDeleteMonthlyExpense 
} from "../lib/hooks/monthlyExpense.hook";
import { 
  getAllDailyExpenses, 
  useCreateDailyExpense, 
  useDeleteDailyExpense 
} from "../lib/hooks/dailyExpense.hook"; 

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STANDARD_EXPENSE_CATEGORIES = ["Staff Wages", "Miscellaneous"];
const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel" , "Sui Gas", "Water Bill", "Internet", "Rent", "Security Guard", "Miscellaneous"];
const DAILY_EXPENSE_CATEGORIES = ["Kitchen/Tea", "Maintenance", "Petty Cash", "Office"];

const ADDON_CATEGORIES = [
  "Pepsi Co.", "Coca Cola Co.", "Fresh Flower", "Cola Next", "Dance Floor",
  "Water Bottles", "Ayaz Tissue", "Stage", "Fire Crackers", "Ladies Staff", "Miscellaneous" , "BBQ" , "Sound System", "Entry" , "Decoration"
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
function getPKTDateISO(dateInput = new Date()) {
  const parsed = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}
const ADDON_PAYMENT_METHODS = ["Cash", "JazzCash", "EasyPaisa", "Habib Metro Usman", "Meezan Bank Sadar"];

function getBookingRevenue(b) {
  const status = (b.status || "").toString().toLowerCase();
  const total = Number(b.total_amount ?? b.totalAmount ?? 0) || 0;
  const advance = Number(b.advance_paid ?? b.advancePaid ?? 0) || 0;
  if (status === "finished" || status === "completed") return total;
  if (["confirmed", "pending", "cancelled"].includes(status)) return advance;
  return 0;
}

function normalizeBooking(b) {
  return {
    id: b.id,
    hall: b.venue,
    client: b.client,
    event: b.event,
    date: b.date,
    status: b.status,
    revenue: getBookingRevenue(b),
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

function ReceivedButton({ addon, onMark }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("Cash");

  if (addon.received) {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
        Received
      </span>
    );
  }

  if (open) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="text-[9px] border border-stone-200 rounded-md px-1 py-0.5 outline-none"
        >
          {ADDON_PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <button
          onClick={() => {
            onMark(addon.id, method);
            setOpen(false);
          }}
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-600 text-white"
        >
          ✓
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 shrink-0"
    >
      Mark Received
    </button>
  );
}

function AddonRow({ addon, onDelete, onUpdate, onMarkReceived }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    service: addon.service,
    description: addon.description,
    client_price: addon.client_price,
    vendor_cost: addon.vendor_cost,
  });

  const commission = Number(addon.client_price || 0) - Number(addon.vendor_cost || 0);

  function save() {
    onUpdate(addon.id, {
      ...draft,
      client_price: Number(draft.client_price || 0),
      vendor_cost: Number(draft.vendor_cost || 0),
    });
    setIsEditing(false);
  }

  function cancel() {
    setDraft({
      service: addon.service,
      description: addon.description,
      client_price: addon.client_price,
      vendor_cost: addon.vendor_cost,
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="border border-violet-200 rounded-lg p-2.5 bg-violet-50/40 mb-1.5 space-y-1.5">
        <select
          value={draft.service}
          onChange={(e) => setDraft({ ...draft, service: e.target.value })}
          className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-[11px] outline-none focus:border-violet-500 bg-white"
        >
          {ADDON_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Description / Notes"
          className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-[11px] outline-none focus:border-violet-500"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="number"
            value={draft.client_price}
            onChange={(e) => setDraft({ ...draft, client_price: e.target.value })}
            placeholder="Client Price"
            className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-[11px]"
          />
          <input
            type="number"
            value={draft.vendor_cost}
            onChange={(e) => setDraft({ ...draft, vendor_cost: e.target.value })}
            placeholder="Vendor Cost"
            className="w-full px-2.5 py-1 border border-stone-200 rounded-md text-[11px]"
          />
        </div>
        <div className="flex gap-1.5 pt-0.5">
          <button onClick={save} className="flex-1 py-1 bg-violet-600 text-white text-[11px] font-medium rounded-md">
            Save
          </button>
          <button onClick={cancel} className="px-3 py-1 bg-white text-stone-600 border border-stone-200 text-[11px] rounded-md">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0 gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-stone-800 truncate">{addon.service}</p>
        <p className="text-[10px] text-stone-400 truncate">{addon.description}</p>
        <p className="text-[10px] text-violet-600 font-medium mt-0.5">
          Commission: {currency(commission)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] font-semibold text-stone-700">{currency(addon.client_price)}</span>
        <ReceivedButton addon={addon} onMark={onMarkReceived} />
        <button onClick={() => setIsEditing(true)} className="text-stone-300 hover:text-violet-600 p-0.5">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(addon.id)} className="text-stone-300 hover:text-rose-600 p-0.5">
          <X size={13} />
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
        {new Date(booking.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short" })}
      </span>
    </div>
  );
}

export default function Management() {
  const { data: rawExpenses } = getAllExpenses() || {};
  const expenses = Array.isArray(rawExpenses) ? rawExpenses : (rawExpenses?.data || []);

  const { data: rawAddons } = getAllAddons() || {};
  const addons = Array.isArray(rawAddons) ? rawAddons : (rawAddons?.data || []);

  const { data: rawMonthlyExpenses } = getAllMonthlyExpenses() || {};
  const allMonthlyExpenses = Array.isArray(rawMonthlyExpenses) ? rawMonthlyExpenses : (rawMonthlyExpenses?.data || []);

  const { data: rawDailyExpenses } = getAllDailyExpenses() || {};
  const allDailyExpenses = Array.isArray(rawDailyExpenses) ? rawDailyExpenses : (rawDailyExpenses?.data || []);
  
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const createAddonMutation = useCreateAddon();
  const deleteAddonMutation = useDeleteAddon();
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense();
  const createDailyExpenseMutation = useCreateDailyExpense();
  const deleteDailyExpenseMutation = useDeleteDailyExpense();
  const updateAddonMutation = useUpdateAddon();
  const markReceived = useMarkAddonReceived();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPerPage = 10;
  const [hallFilter, setHallFilter] = useState("all");
  const [addingMonthly, setAddingMonthly] = useState(false);
  const [newMonthly, setNewMonthly] = useState({
    category: MONTHLY_EXPENSE_CATEGORIES[0], label: "", amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(),
  });

  const [addingDaily, setAddingDaily] = useState(false);
  const [newDaily, setNewDaily] = useState({
    category: DAILY_EXPENSE_CATEGORIES[0], label: "", amount: "", date: getPKTDateISO(),
  });

  const { data: rawBookings = [] } = getAllBookings() || {};
  const bookings = useMemo(() => {
    return rawBookings.map(normalizeBooking);
  }, [rawBookings]);

  const [mode, setMode] = useState("expense");
  const [newExp, setNewExp] = useState({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
  const [newAddon, setNewAddon] = useState({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "", description: "" });
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

  const ledgerFilteredBookings = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    if (!q) return filteredBookings;
    return filteredBookings.filter((b) => {
      return (
        (b.client || "").toLowerCase().includes(q) ||
        (b.event || "").toLowerCase().includes(q) ||
        (b.hall || "").toLowerCase().includes(q)
      );
    });
  }, [filteredBookings, ledgerSearch]);

  const ledgerTotalPages = ledgerSearch.trim() ? 1 : Math.max(1, Math.ceil(ledgerFilteredBookings.length / ledgerPerPage));
  useEffect(() => {
    if (ledgerPage > ledgerTotalPages) setLedgerPage(ledgerTotalPages);
  }, [ledgerPage, ledgerTotalPages]);

  const displayedLedgerBookings = ledgerSearch.trim()
    ? ledgerFilteredBookings
    : ledgerFilteredBookings.slice((ledgerPage - 1) * ledgerPerPage, ledgerPage * ledgerPerPage);

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

  // Logic: Addons added to revenue ONLY if received
  const totalRevenue = useMemo(() => {
    const bookingRev = filteredBookings.reduce((s, b) => s + b.revenue, 0);
    const addonRev = filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => {
        return acc + (a.received ? Number(a.client_price || 0) : 0);
      }, 0);
    }, 0);
    return bookingRev + addonRev;
  }, [filteredBookings, addonsByBooking]);

  const totalExpense = useMemo(() => {
    const stdExp = filteredBookings.reduce((s, b) => {
      return s + (expensesByBooking[b.id] || []).reduce((acc, e) => acc + Number(e.amount || 0), 0);
    }, 0);
    
    // Logic: Vendor costs added ONLY if addon marked received
    const vendorExp = filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => {
        return acc + (a.received ? Number(a.vendor_cost || 0) : 0);
      }, 0);
    }, 0);

    const monthlyOverhead = allMonthlyExpenses
      .filter(me => {
        const yMatch = me.year === selectedYear;
        const mMatch = selectedMonth === null || (me.month - 1) === selectedMonth;
        return yMatch && mMatch;
      })
      .reduce((s, me) => s + Number(me.amount || 0), 0);
    
    const dailyExp = allDailyExpenses
      .filter(de => {
        const d = new Date(de.date);
        return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth);
      })
      .reduce((s, de) => s + Number(de.amount || 0), 0);

    return stdExp + vendorExp + monthlyOverhead + dailyExp;
  }, [filteredBookings, expensesByBooking, addonsByBooking, allMonthlyExpenses, allDailyExpenses, selectedYear, selectedMonth]);

  const totalProfit = totalRevenue - totalExpense;
  const margin = pct(totalProfit, totalRevenue);

  const totalAddonCommission = useMemo(() => {
    return filteredBookings.reduce((s, b) => {
      return s + (addonsByBooking[b.id] || []).reduce((acc, a) => {
        if (!a.received) return acc;
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
        const bAddonRev = (addonsByBooking[b.id] || []).reduce((acc, a) => {
          return acc + (a.received ? Number(a.client_price || 0) : 0);
        }, 0);
        return s + b.revenue + bAddonRev;
      }, 0);

      const bookingExp = bks.reduce((s, b) => {
        const bStdExp = (expensesByBooking[b.id] || []).reduce((a, e) => a + Number(e.amount || 0), 0);
        // Respect received status for costs in charts
        const bVendorExp = (addonsByBooking[b.id] || []).reduce((a, ad) => {
            return a + (ad.received ? Number(ad.vendor_cost || 0) : 0);
        }, 0);
        return s + bStdExp + bVendorExp;
      }, 0);

      const monthlyOverhead = allMonthlyExpenses
        .filter(me => me.year === selectedYear && (me.month - 1) === idx)
        .reduce((s, me) => s + Number(me.amount || 0), 0);
      
      const dailyExp = allDailyExpenses
        .filter(de => {
          const d = new Date(de.date);
          return d.getFullYear() === selectedYear && d.getMonth() === idx;
        })
        .reduce((s, de) => s + Number(de.amount || 0), 0);

      const exp = bookingExp + monthlyOverhead + dailyExp;
      return { month: m, Revenue: rev, Expenses: exp, profit: rev - exp, bookings: bks.length };
    });
  }, [bookings, selectedYear, hallFilter, expensesByBooking, addonsByBooking, allMonthlyExpenses, allDailyExpenses]);

  const hallMonthlyData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const forHall = (hall) =>
        bookings
          .filter((b) => {
            const d = new Date(b.date);
            return d.getFullYear() === selectedYear && d.getMonth() === idx && b.hall === hall;
          })
          .reduce((s, b) => {
            const bAddonRev = (addonsByBooking[b.id] || []).reduce((acc, a) => {
              return acc + (a.received ? Number(a.client_price || 0) : 0);
            }, 0);
            return s + b.revenue + bAddonRev;
          }, 0);
      return { month: m, "Hall A": forHall("Hall A"), "Hall B": forHall("Hall B") };
    });
  }, [bookings, selectedYear, addonsByBooking]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      (expensesByBooking[b.id] || []).forEach((e) => {
        const val = Number(e.amount || 0);
        map[e.category] = (map[e.category] || 0) + val;
      });
      // Logic: Only add Vendor Payouts if received
      (addonsByBooking[b.id] || []).forEach((a) => {
        if (a.received) {
          const val = Number(a.vendor_cost || 0);
          map["Vendor Payouts"] = (map["Vendor Payouts"] || 0) + val;
        }
      });
    });

    allMonthlyExpenses
      .filter(me => {
        const yMatch = me.year === selectedYear;
        const mMatch = selectedMonth === null || (me.month - 1) === selectedMonth;
        return yMatch && mMatch;
      })
      .forEach(me => {
        map[me.category] = (map[me.category] || 0) + Number(me.amount || 0);
      });
    
    allDailyExpenses
      .filter(de => {
        const d = new Date(de.date);
        return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth);
      })
      .forEach(de => {
        map[de.category] = (map[de.category] || 0) + Number(de.amount || 0);
      });

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings, expensesByBooking, addonsByBooking, allMonthlyExpenses, allDailyExpenses, selectedYear, selectedMonth]);

  const upcomingEvents = useMemo(() => {
    return [...bookings]
      .filter((b) => daysUntil(b.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [bookings]);

  // ── actions ──────────────────────────────────────────────────────────────────
  function addExpense(bookingId) {
    if (!newExp.label || !newExp.amount) return;
    createExpenseMutation.mutate({
      bookingId, category: newExp.category, label: newExp.label, amount: Number(newExp.amount || 0),
    });
    setNewExp({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
    setAddingTo(null);
  }

  function addMonthlyExpense() {
    if (!newMonthly.label || !newMonthly.amount) return;
    createMonthlyExpenseMutation.mutate({
      ...newMonthly, amount: Number(newMonthly.amount || 0),
    });
    setNewMonthly({
      category: MONTHLY_EXPENSE_CATEGORIES[0], label: "", amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    });
    setAddingMonthly(false);
  }

  function addDailyExpense() {
    if (!newDaily.label || !newDaily.amount) return;
    createDailyExpenseMutation.mutate({
      ...newDaily, amount: Number(newDaily.amount || 0),
    });
    setNewDaily({
      category: DAILY_EXPENSE_CATEGORIES[0], label: "", amount: "", date: getPKTDateISO(),
    });
    setAddingDaily(false);
  }

  function addAddon(bookingId) {
    if (!newAddon.service || !newAddon.client_price) return;
    createAddonMutation.mutate({
      bookingId, service: newAddon.service, description: newAddon.description,
      client_price: Number(newAddon.client_price || 0), vendor_cost: Number(newAddon.vendor_cost || 0),
    });
    setNewAddon({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "", description: "" });
    setAddingTo(null);
  }

  function updateAddon(id, data) {
    updateAddonMutation.mutate({ id, data });
  }

  function deleteExpense(id) { deleteExpenseMutation.mutate(id); }
  function deleteAddon(id) { deleteAddonMutation.mutate(id); }

  function handleMarkReceived(id, method) {
    const isBank = method !== "Cash" && method !== "JazzCash" && method !== "EasyPaisa";
    markReceived.mutate({
      id,
      payment_method: isBank ? "Bank Transfer" : method,
      bank_name: isBank ? method : null,
    });
  }

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedBookingExpenses = selectedBookingId ? (expensesByBooking[selectedBookingId] || []) : [];
  const selectedBookingAddons = selectedBookingId ? (addonsByBooking[selectedBookingId] || []) : [];

  const selectedBookingBaseRev = selectedBooking?.revenue || 0;
  const selectedBookingAddonRev = selectedBookingAddons.reduce((s, a) => s + (a.received ? Number(a.client_price || 0) : 0), 0);
  const selectedBookingGrossRev = selectedBookingBaseRev + selectedBookingAddonRev;
  
  const selectedBookingStdExp = selectedBookingExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  // Respect received status for vendor costs in inspector
  const selectedBookingVendorExp = selectedBookingAddons.reduce((s, a) => s + (a.received ? Number(a.vendor_cost || 0) : 0), 0);
  const selectedBookingGrossExp = selectedBookingStdExp + selectedBookingVendorExp;
  
  const selectedBookingNetProfit = selectedBookingGrossRev - selectedBookingGrossExp;
  const selectedBookingAddonCommission = selectedBookingAddons.reduce((s, a) => {
    if (!a.received) return s;
    return s + (Number(a.client_price || 0) - Number(a.vendor_cost || 0));
  }, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-8 antialiased selection:bg-emerald-100">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Management Suite</span>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mt-1">Expense & Profit Ledger</h1>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="bg-stone-100 p-1 rounded-lg flex gap-0.5 border border-stone-200">
            {["all", "Hall A", "Hall B"].map((h) => (
              <button key={h} onClick={() => setHallFilter(h)} className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${hallFilter === h ? "bg-white text-stone-900 shadow-sm font-semibold" : "text-stone-500 hover:text-stone-800"}`}>{h === "all" ? "Both Halls" : h}</button>
            ))}
          </div>

          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-[12px] font-medium text-stone-700 outline-none focus:border-emerald-400 cursor-pointer">{YEARS.map((y) => <option key={y}>{y}</option>)}</select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="flex gap-1 overflow-x-auto max-w-full pb-1 xl:pb-0">
            <button onClick={() => setSelectedMonth(null)} className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all ${selectedMonth === null ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}>All Months</button>
            {MONTHS.map((m, i) => (
              <button key={m} onClick={() => setSelectedMonth(i === selectedMonth ? null : i)} className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium tracking-tight transition-all ${selectedMonth === i ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Gross Revenue" value={currency(totalRevenue)} sub={`Incl. received add-ons`} icon={ArrowUpRight} />
        <KpiCard label="Total Costs" value={currency(totalExpense)} sub="Std + Received Vendor + Overhead" icon={Receipt} />
        <KpiCard label="Net Profit" value={currency(totalProfit)} sub={totalProfit >= 0 ? "Total take-home" : "Running at a loss"} icon={DollarSign} trend={margin} />
        <KpiCard label="Add-on Commission" value={currency(totalAddonCommission)} sub="From received services" icon={PlusCircle} />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-[15px] font-semibold text-stone-900 mb-6">Hall Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hallMonthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke="#F1F1EF" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} /><YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} width={48} /><Tooltip content={<ChartTooltip />} /><Legend verticalAlign="top" align="right" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#78716C" }} />
              <Bar dataKey="Hall A" fill="#336bcc" radius={[3, 3, 0, 0]} /><Bar dataKey="Hall B" fill="#c75638" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between">
          <div><h2 className="text-[15px] font-semibold text-stone-900 mb-5">Expense Breakdown</h2>{categoryBreakdown.length === 0 ? <div className="text-center py-12"><Inbox size={24} className="text-stone-200 mx-auto mb-2" /><p className="text-stone-400 text-[12px]">No expenses logged</p></div> : <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1">{categoryBreakdown.map(([cat, amt]) => { const p = pct(amt, totalExpense); return (<div key={cat}><div className="flex justify-between items-baseline mb-1"><span className="text-[12px] font-medium text-stone-700">{cat}</span><span className="text-[11px] font-semibold text-emerald-700">{p}%</span></div><div className="w-full h-[5px] bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${p}%` }} /></div><p className="text-[11px] text-stone-400 mt-1">{currency(amt)}</p></div>); })}</div>}</div>
          <div className="mt-6 pt-5 border-t border-stone-100"><div className="flex items-center gap-4"><div className="relative w-12 h-12 flex-shrink-0"><svg viewBox="0 0 36 36" className="w-full h-full -rotate-90"><circle cx="18" cy="18" r="16" fill="none" stroke="#F0FDF4" strokeWidth="2.5" /><circle cx="18" cy="18" r="16" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray={`${Math.max(0, margin)} ${100 - Math.max(0, margin)}`} strokeLinecap="round" /></svg><span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stone-900">{margin}%</span></div><div><p className="text-[12px] font-medium text-stone-800">Profit Margin</p><p className="text-[11px] text-emerald-700 mt-0.5 font-medium">{margin >= 40 ? "Excellent distribution" : margin >= 25 ? "Healthy yield" : "Costs need attention"}</p></div></div></div>
        </div>
      </div>

      {/* ── Ledger & Inspector ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center"><div><h2 className="text-[15px] font-semibold text-stone-900">Booking Ledger</h2><p className="text-[11px] text-stone-400 mt-0.5">Select a row to inspect gross costs and add-ons</p></div><SlidersHorizontal size={14} className="text-stone-400" /></div>
          <div className="px-6 py-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <input
                value={ledgerSearch}
                onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                placeholder="Search bookings..."
                className="px-3 py-2 border border-stone-200 rounded-lg text-[13px] outline-none w-64"
              />
              <div className="text-[12px] text-stone-500">{ledgerFilteredBookings.length} results</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">{["Client", "Hall", "Event", "Date", "Revenue", "Costs", "Profit", ""].map((h) => (<th key={h} className="px-5 py-3 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ledgerFilteredBookings.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-stone-400 text-[12px]">No bookings found.</td></tr> : displayedLedgerBookings.map((b) => { 
                  const bAddons = addonsByBooking[b.id] || []; 
                  const bExpenses = expensesByBooking[b.id] || []; 
                  // Logic: Only add revenue/costs in table if received
                  const bAddonRev = bAddons.reduce((s, a) => s + (a.received ? Number(a.client_price || 0) : 0), 0); 
                  const bVendorExp = bAddons.reduce((s, a) => s + (a.received ? Number(a.vendor_cost || 0) : 0), 0); 
                  const bStdExp = bExpenses.reduce((s, e) => s + Number(e.amount || 0), 0); 
                  
                  const bTotalRev = b.revenue + bAddonRev; 
                  const bTotalExp = bStdExp + bVendorExp; 
                  const bPro = bTotalRev - bTotalExp; 
                  const isSel = selectedBookingId === b.id; 
                  return (
                    <tr key={b.id} onClick={() => setSelectedBookingId(isSel ? null : b.id)} className={`cursor-pointer transition-colors duration-150 ${isSel ? "bg-emerald-50/50" : "hover:bg-stone-50"}`}>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-stone-900">{b.client}{bAddons.length > 0 && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded"><PlusCircle size={9} /> {bAddons.length}</span>}</td>
                      <td className="px-5 py-3.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${b.hall === "Hall A" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>{b.hall}</span></td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                      <td className="px-5 py-3.5 text-[12px] text-stone-400">{new Date(b.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short" })}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{currency(bTotalRev)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-rose-600">{currency(bTotalExp)}</td>
                      <td className={`px-5 py-3.5 text-[13px] font-semibold ${bPro >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{bPro >= 0 ? "+" : ""}{currency(bPro)}</td>
                      <td className="px-5 py-3.5 text-right"><button onClick={(e) => { e.stopPropagation(); setAddingTo(b.id); setSelectedBookingId(b.id); }} className="text-[11px] font-medium px-2.5 py-1 bg-stone-50 text-stone-700 border border-stone-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">+ Add</button></td>
                    </tr>
                  ); 
                })}
              </tbody>
            </table>
          </div>

          {!ledgerSearch.trim() && ledgerFilteredBookings.length > 0 && (
            <div className="px-6 py-3 flex items-center justify-end gap-2">
              <button onClick={() => setLedgerPage((p) => Math.max(1, p - 1))} disabled={ledgerPage === 1} className={`px-3 py-1 rounded-lg border text-sm ${ledgerPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>Prev</button>
              <div className="text-sm text-stone-500">Page {ledgerPage} of {ledgerTotalPages}</div>
              <button onClick={() => setLedgerPage((p) => Math.min(ledgerTotalPages, p + 1))} disabled={ledgerPage === ledgerTotalPages} className={`px-3 py-1 rounded-lg border text-sm ${ledgerPage === ledgerTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>Next</button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-[13px] font-semibold text-stone-900">Monthly Overhead</p><p className="text-[11px] text-stone-400 mt-0.5">Bills and recurring costs</p></div>
              {!addingMonthly && <button onClick={() => setAddingMonthly(true)} className="text-[11px] font-medium px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-600 hover:text-white transition-colors">+ Add</button>}
            </div>
            <div className="space-y-2 mb-2">
              {allMonthlyExpenses.filter(me => me.year === selectedYear && (selectedMonth === null || (me.month - 1) === selectedMonth)).map(me => (
                <div key={me.id} className="flex justify-between items-center bg-stone-50 p-2 rounded border border-stone-100 group">
                  <div><p className="text-[12px] font-medium text-stone-800">{me.label}</p><p className="text-[10px] text-stone-400">{me.category} • {MONTHS[me.month - 1]}</p></div>
                  <div className="flex items-center gap-2"><span className="text-[12px] font-semibold">{currency(me.amount)}</span><button onClick={() => deleteMonthlyExpenseMutation.mutate(me.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-600 transition-all"><Trash2 size={12}/></button></div>
                </div>
              ))}
            </div>
            {addingMonthly && <div className="flex flex-col gap-2 pt-2 border-t border-stone-100"><div className="grid grid-cols-2 gap-2"><select value={newMonthly.month} onChange={(e) => setNewMonthly({ ...newMonthly, month: Number(e.target.value) })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white">{MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}</select><select value={newMonthly.year} onChange={(e) => setNewMonthly({ ...newMonthly, year: Number(e.target.value) })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white">{YEARS.map((y) => <option key={y}>{y}</option>)}</select></div><select value={newMonthly.category} onChange={(e) => setNewMonthly({ ...newMonthly, category: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white">{MONTHLY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><input value={newMonthly.label} onChange={(e) => setNewMonthly({ ...newMonthly, label: e.target.value })} placeholder="Label" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" /><input type="number" value={newMonthly.amount} onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })} placeholder="Amount" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" /><div className="flex gap-2"><button onClick={addMonthlyExpense} className="flex-1 py-1.5 bg-amber-600 text-white text-[12px] rounded-lg">Save</button><button onClick={() => setAddingMonthly(false)} className="px-3 py-1.5 bg-white text-stone-500 border border-stone-200 text-[12px] rounded-lg">Cancel</button></div></div>}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-[13px] font-semibold text-stone-900">Daily Expenses</p><p className="text-[11px] text-stone-400 mt-0.5">Petty cash and small spends</p></div>
              {!addingDaily && <button onClick={() => setAddingDaily(true)} className="text-[11px] font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">+ Add</button>}
            </div>
            <div className="space-y-2 mb-2">
              {allDailyExpenses.filter(de => { const d = new Date(de.date); return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth); }).map(de => (
                <div key={de.id} className="flex justify-between items-center bg-stone-50 p-2 rounded border border-stone-100 group">
                  <div><p className="text-[12px] font-medium text-stone-800">{de.label}</p><p className="text-[10px] text-stone-400">{de.category} • {new Date(de.date).toLocaleDateString('en-US', {timeZone: 'Asia/Karachi', day:'numeric', month:'short'})}</p></div>
                  <div className="flex items-center gap-2"><span className="text-[12px] font-semibold">{currency(de.amount)}</span><button onClick={() => deleteDailyExpenseMutation.mutate(de.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-600 transition-all"><Trash2 size={12}/></button></div>
                </div>
              ))}
            </div>
            {addingDaily && <div className="flex flex-col gap-2 pt-2 border-t border-stone-100"><input type="date" value={newDaily.date} onChange={(e) => setNewDaily({ ...newDaily, date: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" /><select value={newDaily.category} onChange={(e) => setNewDaily({ ...newDaily, category: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none bg-white">{DAILY_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><input value={newDaily.label} onChange={(e) => setNewDaily({ ...newDaily, label: e.target.value })} placeholder="Label" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" /><input type="number" value={newDaily.amount} onChange={(e) => setNewDaily({ ...newDaily, amount: e.target.value })} placeholder="Amount" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" /><div className="flex gap-2"><button onClick={addDailyExpense} className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] rounded-lg">Save</button><button onClick={() => setAddingDaily(false)} className="px-3 py-1.5 bg-white text-stone-500 border border-stone-200 text-[12px] rounded-lg">Cancel</button></div></div>}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 flex flex-col overflow-hidden">
            {!selectedBookingId ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]"><div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-3"><Receipt size={16} className="text-stone-400" /></div><p className="text-[13px] font-medium text-stone-700">No booking selected</p><p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">Select a row to inspect its costs.</p></div>
            ) : (
              <>
                <div className="p-5 border-b border-stone-100 bg-stone-50/60">
                  <div className="flex items-start justify-between">
                    <div><span className="text-[9px] font-semibold uppercase tracking-wider bg-stone-100 px-2 py-0.5 rounded text-stone-600 border border-stone-200">{selectedBooking?.hall}</span><p className="text-[14px] font-semibold text-stone-900 mt-1.5">{selectedBooking?.client}</p><p className="text-[11px] text-stone-400 mt-0.5">{selectedBooking?.event} · {new Date(selectedBooking?.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" })}</p></div>
                    <button onClick={() => setSelectedBookingId(null)} className="text-stone-400 hover:text-stone-900 p-1"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {[{ label: "Gross Revenue", value: currency(selectedBookingGrossRev), cls: "text-stone-800" }, 
                      { label: "Total Costs", value: currency(selectedBookingGrossExp), cls: "text-rose-600" }, 
                      { label: "Net Profit", value: currency(selectedBookingNetProfit), cls: selectedBookingNetProfit >= 0 ? "text-emerald-700" : "text-rose-600" }, 
                      { label: "Commission", value: currency(selectedBookingAddonCommission), cls: "text-violet-700" }
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
                  {selectedBookingExpenses.length === 0 ? <p className="text-[12px] text-stone-400 text-center py-4">No costs logged.</p> : selectedBookingExpenses.map((e) => <ExpenseRow key={e.id} expense={e} onDelete={deleteExpense} />)}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500 pt-4 pb-1">Add-on Services</p>
                  {selectedBookingAddons.length === 0 ? (
                    <p className="text-[12px] text-stone-400 text-center py-4">No add-ons logged.</p>
                  ) : (
                    selectedBookingAddons.map((a) => (
                      <AddonRow key={a.id} addon={a} onDelete={deleteAddon} onUpdate={updateAddon} onMarkReceived={handleMarkReceived} />
                    ))
                  )}
                </div>

                <div className="border-t border-stone-100 p-4 bg-stone-50/40">
                  {addingTo === selectedBookingId ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-stone-100 p-1 rounded-lg">
                        <button type="button" onClick={() => setMode("expense")} className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${mode === "expense" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Standard</button>
                        <button type="button" onClick={() => setMode("addon")} className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${mode === "addon" ? "bg-violet-600 text-white shadow-sm" : "text-stone-500"}`}>Add-on</button>
                      </div>

                      {mode === "expense" ? (
                        <>
                          <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-emerald-500 bg-white">{STANDARD_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                          <input value={newExp.label} onChange={(e) => setNewExp({ ...newExp, label: e.target.value })} placeholder="Description" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
                          <input type="number" value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })} placeholder="Amount" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none" />
                          <div className="flex gap-2 mt-1"><button onClick={() => addExpense(selectedBookingId)} className="flex-1 py-1.5 bg-emerald-600 text-white text-[12px] font-medium rounded-lg">Add</button><button onClick={() => setAddingTo(null)} className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] rounded-lg">Cancel</button></div>
                        </>
                      ) : (
                        <>
                          <select value={newAddon.service} onChange={(e) => setNewAddon({ ...newAddon, service: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500 bg-white">{ADDON_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                          <input value={newAddon.description} onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })} placeholder="Description / Notes" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] outline-none focus:border-violet-500" />
                          <div className="grid grid-cols-2 gap-2"><input type="number" value={newAddon.client_price} onChange={(e) => setNewAddon({ ...newAddon, client_price: e.target.value })} placeholder="Client Price" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px]" /><input type="number" value={newAddon.vendor_cost} onChange={(e) => setNewAddon({ ...newAddon, vendor_cost: e.target.value })} placeholder="Vendor Cost" className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-[12px]" /></div>
                          <div className="flex gap-2 mt-1"><button onClick={() => addAddon(selectedBookingId)} className="flex-1 py-1.5 bg-violet-600 text-white text-[12px] font-medium rounded-lg">Add Add-on</button><button onClick={() => setAddingTo(null)} className="px-3 py-1.5 bg-white text-stone-600 border border-stone-200 text-[12px] rounded-lg">Cancel</button></div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(selectedBookingId)} className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-[12px] font-medium text-stone-600 hover:border-emerald-400 hover:text-emerald-700 transition-all flex items-center justify-center gap-1.5"><Plus size={13} /> Add Line Cost / Add-on</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}