import React, { useMemo, useState } from "react";
import {
  Search,
  X,
  Check,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Banknote,
  Scale,
  ReceiptText,
  PackageMinus,
  Loader2,
} from "lucide-react";

import { getAllBookings } from "../lib/hooks/booking.hook";
import { useGetCashflow } from "../lib/hooks/cashflow.hook";
import { useSettleMoneyIn, useSettleMoneyOut } from "../lib/hooks/cashdesk.hook";
import { DAILY_EXPENSE_CATEGORIES } from "../components/Management/ManagementUtils.js";

/* ───────────────────────── helpers ───────────────────────── */

const FONT = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif";
const display = { fontFamily: FONT };
const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');";

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const getPKTDateISO = (dateInput) => {
  const parsedDate = typeof dateInput === "string" ? new Date(dateInput) : dateInput || new Date();
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);
  const p = {};
  parts.forEach((x) => {
    if (x.type !== "literal") p[x.type] = x.value;
  });
  return p.year && p.month && p.day ? `${p.year}-${p.month}-${p.day}` : "";
};

const prettyDate = (d) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));

// `method` is what gets sent to the backend (same strings your payments table already uses)
const ACCOUNTS = [
  { key: "cash", label: "Cash", method: "Cash", dot: "bg-emerald-500" },
  { key: "meezan", label: "Meezan Bank", method: "Meezan Bank Sadar", dot: "bg-blue-500" },
  { key: "habib", label: "Habib Metro", method: "Habib Metro Usman", dot: "bg-indigo-500" },
  { key: "jazzcash", label: "JazzCash", method: "JazzCash", dot: "bg-orange-500" },
  { key: "easypaisa", label: "EasyPaisa", method: "EasyPaisa", dot: "bg-lime-500" },
];
const OTHER_ACCOUNT = { key: "other", label: "Other", dot: "bg-stone-400" };
const LEDGER_ACCOUNTS = [...ACCOUNTS, OTHER_ACCOUNT];

function accountKey(method) {
  const m = (method || "").toLowerCase();
  if (/[+,/&]/.test(m)) return "other";
  const matches = ACCOUNTS.filter((account) => m.includes(account.method.toLowerCase()));
  return matches.length === 1 ? matches[0].key : "other";
}

function formatMethod(method, bank) {
  const m = (method || "Cash").trim();
  const b = (bank || "").trim();
  if (!b && !m.includes("(")) return m;
  if (b && !m.toLowerCase().includes(b.toLowerCase())) return `${m} (${b})`;
  return m;
}

// Quick-add items for Money Out. Edit this list to add more.
const QUICK_ITEMS = ["Water bottles", "Coca-Cola", "Pepsi"];
const QUICK_ITEM_CATEGORIES = {
  "Water bottles": "Water Bottles",
  "Coca-Cola": "Coca Cola Co.",
  Pepsi: "Pepsi Co.",
};
const QUANTITY_CATEGORIES = ["Pepsi Co.", "Coca Cola Co.", "Diesel", "Water Bottles"];
const JUMBO_BRANDS = ["Pepsi", "Coca Cola", "Fanta", "Dew", "Sprite", "Other"];

// Tolerant booking field readers (snake_case or camelCase)
const bRNo = (b) => b.r_no ?? b.rNo ?? b.receipt_no ?? "";
const bName = (b) =>
  b.client_name ?? b.clientName ?? b.client ?? b.customer_name ?? b.customerName ?? b.name ?? "Unnamed";
const bHall = (b) => b.hall_name ?? b.hallName ?? b.hall?.name ?? (typeof b.hall === "string" ? b.hall : "");
const bDate = (b) => b.event_date ?? b.eventDate ?? b.date ?? "";
const bTotal = (b) => Number(b.total_amount ?? b.totalAmount ?? 0);
const bPaid = (b) => Number(b.totalReceived ?? b.total_received ?? b.advance_paid ?? b.advancePaid ?? 0);
const bDue = (b) => Math.max(bTotal(b) - bPaid(b), 0);

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const extractArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.bookings)) return raw.bookings;
  return [];
};

/* ───────────────────────── small pieces ───────────────────────── */

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-shadow placeholder:text-stone-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function Field({ label, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-stone-600">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function AmountInput({ value, onChange, onEnter, placeholder = "0" }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">
        Rs
      </span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        placeholder={placeholder}
        className={`${inputCls} py-3 pl-11 text-2xl font-semibold tabular-nums tracking-tight`}
        style={display}
      />
    </div>
  );
}

function Chip({ active, onClick, tone = "dark", children }) {
  const activeCls = {
    dark: "border-stone-900 bg-stone-900 text-white",
    rose: "border-rose-500 bg-rose-50 text-rose-800",
    emerald: "border-emerald-500 bg-emerald-50 text-emerald-900",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(active)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${
        active ? activeCls : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
      }`}
    >
      {children}
    </button>
  );
}

function MethodPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ACCOUNTS.map((a) => (
        <Chip key={a.key} active={value === a.method} tone="emerald" onClick={() => onChange(a.method)}>
          <span className={`h-2 w-2 rounded-full ${a.dot}`} />
          {a.label}
        </Chip>
      ))}
    </div>
  );
}

function MethodBadge({ method }) {
  const acc = LEDGER_ACCOUNTS.find((a) => a.key === accountKey(method));
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
      <span className={`w-1.5 h-1.5 rounded-full ${acc.dot}`} />
      {method}
    </span>
  );
}

function Toast({ notice }) {
  if (!notice) return null;
  const ok = notice.type === "ok";
  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg ${
        ok ? "border-emerald-200 bg-white text-stone-800" : "border-rose-200 bg-white text-stone-800"
      }`}
    >
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
        }`}
      >
        {ok ? <Check size={12} strokeWidth={3} /> : <AlertCircle size={12} strokeWidth={3} />}
      </span>
      {notice.text}
    </div>
  );
}

function PanelHeader({ icon, tint, title, hint, aside }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold text-stone-900" style={display}>
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
      </div>
      {aside && (
        <span className="shrink-0 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-medium tabular-nums text-stone-600">
          {aside}
        </span>
      )}
    </div>
  );
}

function BookingRow({ b, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(b)}
      className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-stone-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
        {initials(bName(b))}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900">{bName(b)}</p>
        <p className="mt-0.5 truncate text-[11px] text-stone-500">
          {[bRNo(b) !== "" && `R.No. ${bRNo(b)}`, bHall(b), bDate(b) && prettyDate(bDate(b))]
            .filter(Boolean)
            .join("  ·  ")}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums ${
          bDue(b) > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {bDue(b) > 0 ? `${currency(bDue(b))} due` : "Paid in full"}
      </span>
    </button>
  );
}

function SettleBar({ summary, label, disabled, pending, onClick, tone = "emerald" }) {
  const buttonTone =
    tone === "emerald"
      ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30"
      : "bg-stone-900 hover:bg-stone-700 focus-visible:ring-stone-900/20";

  return (
    <div className="-mx-5 -mb-5 mt-6 flex items-center justify-between gap-4 rounded-b-2xl border-t border-stone-100 bg-stone-50/70 px-5 py-4">
      <p className="min-w-0 text-xs leading-snug text-stone-500">{summary}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex shrink-0 items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 ${buttonTone}`}
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen w-full bg-stone-50/60 p-3 lg:p-4">
      <div className="w-full animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-stone-200/70" />
        <div className="h-44 rounded-2xl bg-stone-200/60" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-2xl bg-stone-200/60" />
          <div className="h-96 rounded-2xl bg-stone-200/60" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Cashflow() {
  /* range */
  const [range, setRange] = useState("today");
  const todayPKT = useMemo(() => getPKTDateISO(), []);
  const [startDate, setStartDate] = useState(todayPKT);
  const [endDate, setEndDate] = useState(todayPKT);
  const [account, setAccount] = useState("all");
  const [flowFilter, setFlowFilter] = useState("all");

  const { queryStart, queryEnd } = useMemo(() => {
    if (range === "today") return { queryStart: todayPKT, queryEnd: todayPKT };
    if (range === "month") {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
      }).formatToParts(new Date());
      const y = parts.find((p) => p.type === "year").value;
      const m = parts.find((p) => p.type === "month").value;
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      return { queryStart: `${y}-${m}-01`, queryEnd: `${y}-${m}-${String(lastDay).padStart(2, "0")}` };
    }
    if (range === "custom") return { queryStart: startDate, queryEnd: endDate };
    return { queryStart: "", queryEnd: "" };
  }, [range, startDate, endDate, todayPKT]);

  /* data */
  const cashflowQuery = useGetCashflow({
    start: range === "all" ? "" : queryStart,
    end: range === "all" ? "" : queryEnd,
    range,
  });
  const activity = cashflowQuery?.data?.activity || [];
  const isLoading = cashflowQuery.isLoading;

  const bookingsQuery = getAllBookings();
  const bookings = useMemo(() => extractArray(bookingsQuery?.data), [bookingsQuery?.data]);

  // Single source of truth: every number below is computed from these rows
  const rows = useMemo(
    () =>
      activity.map((item) => ({
        id: item.id,
        flow: item.flow,
        category: item.category,
        note: item.note,
        who: item.who || "—",
        receiptNo: item.receiptNo,
        addonService: item.addonService || null,
        method: formatMethod(item.method),
        amount: Number(item.amount) || 0,
        date: item.time,
      })),
    [activity]
  );

  const perAccount = useMemo(() => {
    const per = {};
    LEDGER_ACCOUNTS.forEach((a) => (per[a.key] = { in: 0, out: 0 }));
    rows.forEach((r) => {
      const k = accountKey(r.method);
      if (r.flow === "IN") per[k].in += r.amount;
      else per[k].out += r.amount;
    });
    return per;
  }, [rows]);

  const scope = account === "all" ? LEDGER_ACCOUNTS.map((a) => a.key) : [account];
  const totalIn = scope.reduce((s, k) => s + perAccount[k].in, 0);
  const totalOut = scope.reduce((s, k) => s + perAccount[k].out, 0);
  const net = totalIn - totalOut;

  const handKey = account === "all" ? "cash" : account;
  const inHand = perAccount[handKey].in - perAccount[handKey].out;
  const handLabel =
    account === "all" || account === "cash"
      ? "Cash in hand"
      : `${LEDGER_ACCOUNTS.find((a) => a.key === account).label} balance`;

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (account === "all" || accountKey(r.method) === account) &&
          (flowFilter === "all" || r.flow === flowFilter)
      ),
    [rows, account, flowFilter]
  );

  const rangeLabel =
    range === "today" ? "today" : range === "month" ? "this month" : range === "all" ? "all time" : "selected range";

  const subtitle = useMemo(() => {
    if (range === "today")
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    if (range === "month")
      return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", month: "long", year: "numeric" }).format(
        new Date()
      );
    if (range === "all") return "All records";
    return startDate && endDate ? `${prettyDate(startDate)} to ${prettyDate(endDate)}` : "Pick a date range";
  }, [range, startDate, endDate]);

  /* notices */
  const [notice, setNotice] = useState(null); // { type: "ok" | "err", text }
  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  /* ── Money In ── */
  const settleIn = useSettleMoneyIn();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [inAmount, setInAmount] = useState("");
  const [inMethod, setInMethod] = useState("Cash");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || picked) return [];
    return bookings
      .filter((b) => (b?.status || "").toLowerCase() !== "cancelled")
      .filter((b) => String(bRNo(b)).toLowerCase().includes(q) || String(bName(b)).toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, picked, bookings]);

  const suggested = useMemo(
    () =>
      bookings
        .filter((b) => {
          const status = (b?.status || "").toLowerCase();
          const eventDate = getPKTDateISO(bDate(b));
          return (
            status !== "cancelled" &&
            status !== "finished" &&
            status !== "completed" &&
            Boolean(eventDate) &&
            eventDate >= todayPKT &&
            bDue(b) > 0
          );
        })
        .sort((a, b) => getPKTDateISO(bDate(a)).localeCompare(getPKTDateISO(bDate(b))))
        .slice(0, 5),
    [bookings, todayPKT]
  );

  const pickBooking = (b) => {
    setPicked(b);
    setQuery("");
    setInAmount(bDue(b) > 0 ? String(bDue(b)) : "");
  };
  const clearPick = () => {
    setPicked(null);
    setInAmount("");
  };

  const inValue = Number(inAmount) || 0;
  const pickedDue = picked ? bDue(picked) : 0;
  const paidPct = picked && bTotal(picked) > 0 ? Math.min(100, (bPaid(picked) / bTotal(picked)) * 100) : 0;
  const inError = picked && inValue > pickedDue ? `More than the ${currency(pickedDue)} due` : null;
  const canSettleIn = picked && inValue > 0 && !inError && !settleIn.isPending;

  const submitIn = () => {
    if (!canSettleIn) return;
    settleIn.mutate(
      {
        bookingId: picked.id,
        rNo: bRNo(picked),
        amount: inValue,
        method: inMethod,
        isFinished: pickedDue > 0 && inValue === pickedDue,
      },
      {
        onSuccess: () => {
          flash("ok", `Received ${currency(inValue)} from ${bName(picked)}`);
          clearPick();
        },
        onError: (e) => flash("err", e?.message || "Could not save payment"),
      }
    );
  };

  /* ── Money Out ── */
  const settleOut = useSettleMoneyOut();
  const [quick, setQuick] = useState(""); // a QUICK_ITEMS value or "other"
  const [outCategory, setOutCategory] = useState("Petty Cash");
  const [otherName, setOtherName] = useState("");
  const [outQty, setOutQty] = useState("1");
  const [outAmount, setOutAmount] = useState("");
  const [jumboBrand, setJumboBrand] = useState(JUMBO_BRANDS[0]);
  const [otherJumboBrand, setOtherJumboBrand] = useState("");

  const hasOutQuantity = QUANTITY_CATEGORIES.includes(outCategory) || outCategory === "JUMBO";
  const selectedJumboBrand = jumboBrand === "Other" ? otherJumboBrand.trim() : jumboBrand;
  const outItem =
    quick === "other"
      ? otherName.trim() || (hasOutQuantity ? outCategory : "")
      : !hasOutQuantity && !quick
      ? otherName.trim()
      : quick || (outCategory === "JUMBO" ? selectedJumboBrand : outCategory);
  const outQuantity = Number(outQty);
  const outValue = Number(outAmount) || 0;
  const canSettleOut =
    outItem &&
    outValue > 0 &&
    (!hasOutQuantity || (Number.isInteger(outQuantity) && outQuantity > 0)) &&
    (!hasOutQuantity || outCategory !== "JUMBO" || selectedJumboBrand) &&
    !settleOut.isPending;

  const selectOutCategory = (category) => {
    setOutCategory(category);
    setOtherName("");
    setOtherJumboBrand("");
    setJumboBrand(JUMBO_BRANDS[0]);

    const quickItem = Object.keys(QUICK_ITEM_CATEGORIES).find(
      (item) => QUICK_ITEM_CATEGORIES[item] === category
    );
    if (quickItem) setQuick(quickItem);
    else if (QUANTITY_CATEGORIES.includes(category) || category === "JUMBO") setQuick("");
    else setQuick("other");
  };

  const submitOut = () => {
    if (!canSettleOut) return;
    const label =
      outCategory === "JUMBO"
        ? `${selectedJumboBrand} ${outQuantity}`
        : hasOutQuantity && quick === "other" && otherName.trim()
          ? `${outItem} x ${outQuantity}`
          : hasOutQuantity
            ? String(outQuantity)
            : outItem;

    settleOut.mutate(
      {
        item: outItem,
        label,
        category: outCategory,
        quantity: hasOutQuantity ? outQuantity : 1,
        amount: outValue,
        date: getPKTDateISO(new Date()),
      },
      {
        onSuccess: () => {
          flash("ok", `Paid out ${currency(outValue)} for ${outItem}`);
          setQuick("");
          setOutCategory("Petty Cash");
          setOtherName("");
          setOutQty("1");
          setOutAmount("");
          setJumboBrand(JUMBO_BRANDS[0]);
          setOtherJumboBrand("");
        },
        onError: (e) => flash("err", e?.message || "Could not save expense"),
      }
    );
  };

  /* ───────────────────────── render ───────────────────────── */

  if (isLoading) return <Skeleton />;

  const stats = [
    {
      label: "Cash in",
      value: totalIn,
      icon: <TrendingUp size={16} />,
      badge: "bg-emerald-50 text-emerald-600",
      tone: "text-stone-900",
    },
    {
      label: "Cash out",
      value: totalOut,
      icon: <TrendingDown size={16} />,
      badge: "bg-rose-50 text-rose-500",
      tone: "text-stone-900",
    },
    {
      label: handLabel,
      value: inHand,
      icon: <Banknote size={16} />,
      badge: "bg-sky-50 text-sky-600",
      tone: inHand < 0 ? "text-rose-600" : "text-stone-900",
    },
    {
      label: "Net cashflow",
      value: net,
      icon: <Scale size={16} />,
      badge: "bg-stone-100 text-stone-600",
      tone: net < 0 ? "text-rose-600" : "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-stone-50/60 text-stone-800 antialiased" style={display}>
      <style>{FONT_IMPORT}</style>
      <div className="w-full px-3 py-3 lg:px-4 lg:py-4">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight" style={display}>
              Cash Flow
            </h1>
            <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-stone-200 bg-white p-1 text-xs shadow-sm">
              {[
                { key: "today", label: "Today" },
                { key: "month", label: "This month" },
                { key: "all", label: "All time" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
                    range === r.key ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <button
                onClick={() => setRange("custom")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
                  range === "custom" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Calendar size={13} />
                Custom
              </button>
            </div>

            {range === "custom" && (
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs shadow-sm">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent outline-none text-stone-700"
                />
                <span className="text-stone-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent outline-none text-stone-700"
                />
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="rounded-2xl border border-stone-200/80 bg-white shadow-sm mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-stone-100">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`p-4 lg:p-5 ${i > 1 ? "border-t border-stone-100 lg:border-t-0" : ""} ${
                  i % 2 === 1 ? "border-l border-stone-100 lg:border-l-0" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.badge}`}>{s.icon}</span>
                  <span className="text-xs font-medium text-stone-500">{s.label}</span>
                </div>
                <p
                  className={`mt-3 text-2xl lg:text-[28px] leading-none font-semibold tracking-tight tabular-nums ${s.tone}`}
                  style={display}
                >
                  {s.value < 0 ? "-" : ""}
                  {currency(Math.abs(s.value))}
                </p>
                <p className="text-[11px] text-stone-400 mt-2">{rangeLabel}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 bg-stone-50/50 rounded-b-2xl px-4 py-3 lg:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-stone-500 mr-1">Account</span>
              <button
                onClick={() => setAccount("all")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  account === "all"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                All
              </button>
              {LEDGER_ACCOUNTS.map((a) => {
                const bal = perAccount[a.key].in - perAccount[a.key].out;
                const active = account === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => setAccount(a.key)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                    <span className="font-medium">{a.label}</span>
                    <span className={`tabular-nums ${bal < 0 ? "text-rose-600" : "text-stone-500"}`}>
                      {bal < 0 ? "-" : ""}
                      {currency(Math.abs(bal))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Money in / Money out */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* MONEY IN */}
          <section className="flex flex-col rounded-2xl border border-stone-200/80 border-t-2 border-t-emerald-500 bg-white p-5 shadow-sm">
            <PanelHeader
              icon={<ArrowUpRight size={17} />}
              tint="bg-emerald-50 text-emerald-600"
              title="Money in"
              hint="Receive a payment against a booking."
              aside={`${currency(totalIn)} ${rangeLabel}`}
            />

            <div className="flex-1">
            {!picked ? (
              <div>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by receipt number or client name"
                    className={`${inputCls} pl-10`}
                  />
                </div>

                {matches.length > 0 && (
                  <ul className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                    {matches.map((b) => (
                      <li key={b.id}>
                        <BookingRow b={b} onPick={pickBooking} />
                      </li>
                    ))}
                  </ul>
                )}

                {query.trim() && matches.length === 0 && (
                  <p className="mt-4 text-sm text-stone-500">No booking matches “{query.trim()}”. Check the receipt number or spelling.</p>
                )}

                {!query.trim() && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-stone-700">Upcoming bookings</p>
                      <span className="text-[11px] text-stone-400">Next 5 with a balance due</span>
                    </div>
                    {suggested.length > 0 ? (
                      <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                        {suggested.map((b) => (
                          <li key={b.id}>
                            <BookingRow b={b} onPick={pickBooking} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-200 px-6 py-8 text-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                          <ReceiptText size={18} />
                        </span>
                        <p className="mt-3 text-sm font-medium text-stone-700">No upcoming balances due</p>
                        <p className="mt-1 text-xs text-stone-400">
                          Upcoming bookings with an outstanding balance will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-600">
                      {initials(bName(picked))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{bName(picked)}</p>
                      <p className="mt-0.5 truncate text-[11px] text-stone-500">
                        {[bRNo(picked) !== "" && `R.No. ${bRNo(picked)}`, bHall(picked)].filter(Boolean).join("  ·  ")}
                      </p>
                    </div>
                    <button
                      onClick={clearPick}
                      aria-label="Choose a different booking"
                      className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-200">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-stone-500">Total</p>
                      <p className="mt-0.5 font-semibold tabular-nums text-stone-900" style={display}>
                        {currency(bTotal(picked))}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">Paid</p>
                      <p className="mt-0.5 font-semibold tabular-nums text-emerald-700" style={display}>
                        {currency(bPaid(picked))}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">Due</p>
                      <p className="mt-0.5 font-semibold tabular-nums text-amber-700" style={display}>
                        {currency(pickedDue)}
                      </p>
                    </div>
                  </div>
                </div>

                <Field
                  label="Amount received"
                  action={
                  pickedDue > 0 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInAmount(String(Math.round(pickedDue / 2)))}
                        className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-200"
                      >
                        Half
                      </button>
                      <button
                        type="button"
                        onClick={() => setInAmount(String(pickedDue))}
                        className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Full due
                      </button>
                    </div>
                  )
                  }
                >
                  <AmountInput value={inAmount} onChange={setInAmount} onEnter={submitIn} />
                  {inError && <p className="mt-1.5 text-xs text-rose-600">{inError}</p>}
                  {pickedDue === 0 && <p className="mt-1.5 text-xs text-emerald-700">This booking is paid in full.</p>}
                </Field>

                <Field label="Method">
                  <MethodPicker value={inMethod} onChange={setInMethod} />
                </Field>

              </div>
            )}
            </div>
            {picked && (
              <SettleBar
                tone="emerald"
                summary={
                  inValue > 0 && !inError ? (
                    <>
                      <span className="font-medium text-stone-700">
                        {currency(Math.max(pickedDue - inValue, 0))}
                      </span>{" "}
                      will remain due after this payment
                    </>
                  ) : (
                    "Enter the amount to settle"
                  )
                }
                label={inValue > 0 ? `Settle ${currency(inValue)}` : "Settle"}
                disabled={!canSettleIn}
                pending={settleIn.isPending}
                onClick={submitIn}
              />
            )}
          </section>

          {/* MONEY OUT */}
          <section className="flex flex-col rounded-2xl border border-stone-200/80 border-t-2 border-t-rose-400 bg-white p-5 shadow-sm">
            <PanelHeader
              icon={<ArrowDownRight size={17} />}
              tint="bg-rose-50 text-rose-500"
              title="Money out"
              hint="Record an expense paid from the desk."
              aside={`${currency(totalOut)} ${rangeLabel}`}
            />

            <div className="flex-1 space-y-5">
              <Field label="Category">
                <div className="flex flex-wrap gap-1.5">
                  {DAILY_EXPENSE_CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      tone="rose"
                      active={outCategory === category}
                      onClick={() => selectOutCategory(category)}
                    >
                      {category}
                    </Chip>
                  ))}
                </div>
              </Field>

              {outCategory !== "JUMBO" && (
                <Field label="Item">
                  <div className="flex flex-wrap gap-1.5">
                    {[...QUICK_ITEMS, "other"].map((q) => (
                      <Chip
                        key={q}
                        active={quick === q}
                        onClick={() => {
                          if (quick === q) {
                            setQuick("");
                          } else {
                            setQuick(q);
                            if (QUICK_ITEM_CATEGORIES[q]) {
                              setOutCategory(QUICK_ITEM_CATEGORIES[q]);
                              setOtherName("");
                            }
                          }
                        }}
                      >
                        {q === "other" && <PackageMinus size={13} />}
                        {q === "other" ? "Other" : q}
                      </Chip>
                    ))}
                  </div>
                </Field>
              )}

              {outCategory === "JUMBO" && (
                <Field label="JUMBO brand">
                  <div className="flex flex-wrap gap-1.5">
                    {JUMBO_BRANDS.map((brand) => (
                      <Chip key={brand} tone="rose" active={jumboBrand === brand} onClick={() => setJumboBrand(brand)}>
                        {brand}
                      </Chip>
                    ))}
                  </div>
                  {jumboBrand === "Other" && (
                    <input
                      autoFocus
                      value={otherJumboBrand}
                      onChange={(e) => setOtherJumboBrand(e.target.value)}
                      placeholder="Enter brand"
                      className={`${inputCls} mt-2.5`}
                    />
                  )}
                </Field>
              )}

              {(quick === "other" || !hasOutQuantity) && outCategory !== "JUMBO" && (
                <Field label={hasOutQuantity ? "Item (optional)" : "What was it for?"}>
                  <input
                    autoFocus={!hasOutQuantity}
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder={hasOutQuantity ? "Item description" : "Expense description"}
                    className={inputCls}
                  />
                </Field>
              )}

              <div className={hasOutQuantity ? "grid grid-cols-3 gap-3" : ""}>
                {hasOutQuantity && (
                  <Field label="Quantity">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={outQty}
                      onChange={(e) => setOutQty(e.target.value)}
                      className={`${inputCls} py-3 text-2xl font-semibold tabular-nums tracking-tight`}
                      style={display}
                    />
                  </Field>
                )}
                <div className={hasOutQuantity ? "col-span-2" : ""}>
                  <Field label="Total amount paid">
                    <AmountInput value={outAmount} onChange={setOutAmount} onEnter={submitOut} />
                  </Field>
                </div>
              </div>

            </div>

            <SettleBar
              tone="dark"
              summary={
                outValue > 0 ? (
                  <>
                    <span className="font-medium text-stone-700">{outCategory || "Expense"}</span> · paid in Cash
                  </>
                ) : (
                  "Pick a category and enter the amount"
                )
              }
              label={outValue > 0 ? `Settle ${currency(outValue)}` : "Settle"}
              disabled={!canSettleOut}
              pending={settleOut.isPending}
              onClick={submitOut}
            />
          </section>
        </div>

        {/* Activity */}
        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-stone-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-stone-900" style={display}>
                Activity
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {visibleRows.length} {visibleRows.length === 1 ? "record" : "records"}
                {account !== "all" && ` in ${LEDGER_ACCOUNTS.find((a) => a.key === account).label}`}
              </p>
            </div>
            <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs">
              {[
                { key: "all", label: "All" },
                { key: "IN", label: "In" },
                { key: "OUT", label: "Out" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFlowFilter(f.key)}
                  className={`rounded-md px-3.5 py-1.5 font-medium transition-colors ${
                    flowFilter === f.key ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/60 text-[11px] font-medium text-stone-500">
                  <th className="w-12 px-5 py-3"></th>
                  <th className="px-3 py-3">Details</th>
                  <th className="px-3 py-3">Client / payee</th>
                  <th className="px-3 py-3">Method</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <p className="text-sm font-medium text-stone-700">Nothing recorded for this period</p>
                      <p className="mt-1 text-xs text-stone-400">Use Money in or Money out above to add the first entry.</p>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-stone-50/60">
                      <td className="px-5 py-3.5">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            item.flow === "IN" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                          }`}
                          title={item.flow === "IN" ? "Money in" : "Money out"}
                        >
                          {item.flow === "IN" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[13px] font-medium text-stone-900">{item.category}</p>
                        {(item.addonService || item.note) && (
                          <p className="mt-0.5 text-[11px] text-stone-500">{item.addonService || item.note}</p>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-stone-600">
                        <p>{item.who}</p>
                        {item.receiptNo && <p className="mt-0.5 text-[11px] text-stone-400">R.No. {item.receiptNo}</p>}
                      </td>
                      <td className="px-3 py-3.5">
                        <MethodBadge method={item.method} />
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-stone-500">{getPKTDateISO(item.date)}</td>
                      <td
                        className={`px-5 py-3.5 text-right text-sm font-semibold tabular-nums ${
                          item.flow === "IN" ? "text-stone-900" : "text-rose-600"
                        }`}
                        style={display}
                      >
                        {item.flow === "IN" ? "+" : "-"}
                        {currency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Toast notice={notice} />
    </div>
  );
}