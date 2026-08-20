import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt as ReceiptIcon,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllExpenses } from "../lib/hooks/expense.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";
import { getAllDailyExpenses } from "../lib/hooks/dailyExpense.hook";
import { getAllMonthlyExpenses } from "../lib/hooks/monthlyExpense.hook";
import { getAllPayments } from "../lib/hooks/payment.hook";

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const getPKTDateISO = (dateInput = new Date()) => {
  if (!dateInput) return "";
  let d = dateInput;

  if (typeof dateInput === "string" && dateInput.trim().length === 7) {
    d = `${dateInput.trim()}-01`;
  }

  const parsedDate = typeof d === "string" ? new Date(d) : d;
  if (isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
};

function formatMethod(method, bank) {
  const m = (method || "Cash").trim();
  const b = (bank || "").trim();

  if (!b && !m.includes("(")) return m;
  if (b && !m.toLowerCase().includes(b.toLowerCase())) {
    return `${m} (${b})`;
  }
  return m;
}

export default function Cashflow() {
  const [range, setRange] = useState("today");
  const todayPKT = useMemo(() => getPKTDateISO(), []);

  const [startDate, setStartDate] = useState(todayPKT);
  const [endDate, setEndDate] = useState(todayPKT);

  const { queryStart, queryEnd } = useMemo(() => {
    if (range === "today") {
      return { queryStart: todayPKT, queryEnd: todayPKT };
    }
    if (range === "month") {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
      }).formatToParts(now);

      const y = parts.find((p) => p.type === "year").value;
      const m = parts.find((p) => p.type === "month").value;

      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      return {
        queryStart: `${y}-${m}-01`,
        queryEnd: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
      };
    }
    if (range === "custom") {
      return { queryStart: startDate, queryEnd: endDate };
    }
    return { queryStart: "", queryEnd: "" };
  }, [range, startDate, endDate, todayPKT]);

  const bookingsQuery = getAllBookings();
  const expensesQuery = getAllExpenses();
  const addonsQuery = getAllAddons();
  const dailyQuery = getAllDailyExpenses();
  const monthlyQuery = getAllMonthlyExpenses();
  const paymentsQuery = getAllPayments();

  const extractArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.expenses)) return raw.expenses;
    if (Array.isArray(raw?.dailyExpenses)) return raw.dailyExpenses;
    if (Array.isArray(raw?.monthlyExpenses)) return raw.monthlyExpenses;
    if (Array.isArray(raw?.addons)) return raw.addons;
    if (Array.isArray(raw?.payments)) return raw.payments;
    return [];
  };

  const bookings = useMemo(() => extractArray(bookingsQuery?.data), [bookingsQuery?.data]);
  const expenses = useMemo(() => extractArray(expensesQuery?.data), [expensesQuery?.data]);
  const addons = useMemo(() => extractArray(addonsQuery?.data), [addonsQuery?.data]);
  const dailyExpenses = useMemo(() => extractArray(dailyQuery?.data), [dailyQuery?.data]);
  const monthlyExpenses = useMemo(() => extractArray(monthlyQuery?.data), [monthlyQuery?.data]);
  const payments = useMemo(() => {
    const raw = paymentsQuery?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.payments)) return raw.payments;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  }, [paymentsQuery?.data]);

  const isWithinRange = (dateStr) => {
    if (!dateStr || range === "all") return true;

    const recordPKTDate = getPKTDateISO(dateStr);
    if (!recordPKTDate) return true;

    if (queryStart && recordPKTDate < queryStart) return false;
    if (queryEnd && recordPKTDate > queryEnd) return false;
    return true;
  };

  const outstandingReceivables = useMemo(() => {
    return bookings
      .filter((b) => {
        const st = (b?.status || "").toLowerCase();
        return st !== "cancelled" && st !== "finished" && st !== "completed";
      })
      .reduce((s, b) => {
        const due = Number(b.total_amount || b.totalAmount || 0) - Number(b.advance_paid || b.advancePaid || 0);
        return s + (due > 0 ? due : 0);
      }, 0);
  }, [bookings]);

  const mergedActivity = useMemo(() => {
    const items = [];

    // Create a set of add-on IDs and service names to cross-reference and skip in payments
    const addonIds = new Set(addons.map((a) => String(a.id)));
    const addonServices = new Set(addons.map((a) => (a.service || "").toLowerCase().trim()));

    // 1. REAL PAYMENTS (Skip any payment tied to an add-on so it only shows from the addons hook)
    payments.forEach((p) => {
      const recordDate = p.created_at || p.createdAt || p.date;
      if (!isWithinRange(recordDate)) return;

      const pCat = (p.category || "").toLowerCase();
      const pNote = (p.note || "").toLowerCase();
      
      // Check if this payment record belongs to an add-on
      const isAddonPayment =
        (p.addon_id && addonIds.has(String(p.addon_id))) ||
        pCat.includes("add-on") ||
        pCat.includes("addon") ||
        Array.from(addonServices).some((svc) => svc && pNote.includes(svc));

      if (isAddonPayment) {
        return; // Skip! Do not show from payments table; handled by addons hook below.
      }

      items.push({
        id: `payment-${p.id}`,
        flow: (p.flow || "IN").toUpperCase(),
        category: p.category || "Payment",
        note: p.note || "—",
        who: p.who || "—",
        method: p.payment_method || p.method || "Cash",
        bankName: p.bank_name || p.bankName || "",
        amount: Number(p.amount || 0),
        status: p.status || "",
        date: recordDate,
      });
    });

    // 2. Add-ons (DISPLAY EXCLUSIVELY FROM ADDONS HOOK)
    addons.forEach((a) => {
      if (!a.received) return;
      const recordDate = a.received_at || a.receivedAt || a.created_at || a.createdAt || a.date;
      if (!isWithinRange(recordDate)) return;

      const clientVal = Number(a.client_price || a.price || 0);
      const vendorVal = Number(a.vendor_cost || 0);
      const rawMethod = a.payment_method || "Cash";

      if (clientVal > 0) {
        items.push({
          id: `addon-in-${a.id}`,
          flow: "IN",
          category: `Add-on: ${a.service || "Service"}`,
          note: a.description || `Client payment for ${a.service || "Addon"}`,
          who: a.client_name || "—",
          method: rawMethod,
          bankName: a.bank_name || "",
          amount: clientVal,
          date: recordDate,
        });
      }

      if (vendorVal > 0) {
        items.push({
          id: `addon-out-${a.id}`,
          flow: "OUT",
          category: "Vendor Payment",
          note: `Vendor Payout (${a.service || "Addon"})`,
          who: a.vendor_name || "Vendor",
          method: "Cash",
          bankName: "",
          amount: vendorVal,
          date: recordDate,
        });
      }
    });

    // 3. Standard Expenses
    expenses.forEach((e) => {
      const recordDate = e.bill_date || e.month || e.created_at || e.createdAt || e.date || e.entry_date;
      if (!isWithinRange(recordDate)) return;

      const cat = (e.category || e.type || e.bill_type || "").toLowerCase();
      const label = (e.label || e.title || e.name || e.description || "").toLowerCase();
      const isCommission = cat.includes("commission") || label.includes("commission");

      const amt = Number(e.amount ?? e.bill_amount ?? e.cost ?? e.total ?? e.expense_amount ?? 0);
      const unitsText = e.units ? ` (${e.units} units)` : "";
      const baseNote = e.label || e.title || e.name || e.description || "Expense Outflow";

      items.push({
        id: `expense-${e.id}`,
        flow: "OUT",
        category: isCommission ? "Agent Commission" : e.category || "Standard Expense",
        note: `${baseNote}${unitsText}`,
        who: e.payee || e.vendor || e.agent_name || "—",
        method: e.payment_method || "Cash",
        bankName: e.bank_name || "",
        amount: amt,
        date: recordDate,
      });
    });

    // 4. Daily Petty Cash
    dailyExpenses.forEach((d) => {
      const recordDate = d.created_at || d.createdAt || d.date;
      if (!isWithinRange(recordDate)) return;

      items.push({
        id: `daily-${d.id}`,
        flow: "OUT",
        category: "Petty Cash",
        note: d.label || d.title || d.category || "Daily Expense",
        who: d.recorded_by || "—",
        method: "Cash",
        bankName: "",
        amount: Number(d.amount ?? d.cost ?? d.expense_amount ?? 0),
        date: recordDate,
      });
    });

    // 5. Monthly Overhead
    monthlyExpenses.forEach((m) => {
      const recordDate = m.created_at || m.createdAt;
      if (!isWithinRange(recordDate)) return;

      const billingPeriod =
        m.month && m.year
          ? new Date(Number(m.year), Number(m.month) - 1, 1).toLocaleDateString("en-PK", {
              month: "long",
              year: "numeric",
            })
          : null;

      items.push({
        id: `monthly-${m.id}`,
        flow: "OUT",
        category: "Monthly Overhead",
        note: `${m.label || m.category || "Recurring Expense"}${billingPeriod ? ` · ${billingPeriod}` : ""}`,
        who: "—",
        method: "Cash",
        bankName: "",
        amount: Number(m.amount ?? 0),
        date: recordDate,
      });
    });

    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [payments, addons, expenses, dailyExpenses, monthlyExpenses, queryStart, queryEnd, range]);
  const totalIn = useMemo(
    () => mergedActivity.filter((i) => i.flow === "IN").reduce((acc, curr) => acc + curr.amount, 0),
    [mergedActivity]
  );

  const totalOut = useMemo(
    () => mergedActivity.filter((i) => i.flow === "OUT").reduce((acc, curr) => acc + curr.amount, 0),
    [mergedActivity]
  );

  const net = totalIn - totalOut;

  const rangeLabel =
    range === "today"
      ? "today"
      : range === "month"
      ? "this month"
      : range === "all"
      ? "all time"
      : "selected range";

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 lg:p-10 text-stone-800 antialiased font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[#00b560] uppercase">
            MANAGEMENT SUITE
          </span>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mt-0.5">
            Cashflow & Revenue Ledger
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-100/70 p-1 rounded-xl text-[12px] border border-stone-200/60">
            {[
              { key: "today", label: "Today" },
              { key: "month", label: "This Month" },
              { key: "all", label: "All Time" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  range === r.key
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setRange("custom")}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                range === "custom"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calendar size={13} />
              Custom
            </button>
          </div>

          {range === "custom" && (
            <div className="flex items-center gap-2 bg-white p-1 px-2 border border-stone-200 rounded-xl shadow-sm text-[12px]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-stone-700"
              />
              <span className="text-stone-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-stone-700"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
              TOTAL MONEY IN
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00b560] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">
              {currency(totalIn)}
            </h2>
            <p className="text-[11px] text-stone-400 mt-2">Inflows ({rangeLabel})</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
              TOTAL MONEY OUT
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">
              {currency(totalOut)}
            </h2>
            <p className="text-[11px] text-stone-400 mt-2">Outflows ({rangeLabel})</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
              NET CASHFLOW
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#00b560] text-white flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2
              className={`text-2xl lg:text-3xl font-semibold tracking-tight ${
                net >= 0 ? "text-stone-900" : "text-rose-600"
              }`}
            >
              {`${net < 0 ? "-" : ""}${currency(Math.abs(net))}`}
            </h2>
            <p className="text-[11px] text-stone-400 mt-2">Net Cashflow ({rangeLabel})</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
              UNCOLLECTED RECEIVABLES
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ReceiptIcon size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">
              {currency(outstandingReceivables)}
            </h2>
            <p className="text-[11px] font-medium text-amber-600 mt-2">
              Active bookings pending balance
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Cash Flow Activity Ledger</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Sourced from payments table + expenses ({rangeLabel})
            </p>
          </div>
          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
            {mergedActivity.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-100 text-stone-400 text-[10px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Flow</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Transaction / Category</th>
                <th className="px-6 py-3">Client / Payee</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {mergedActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400 text-xs">
                    No financial activity recorded for this period.
                  </td>
                </tr>
              ) : (
                mergedActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium ${
                          item.flow === "IN"
                            ? "bg-emerald-50 text-[#00b560]"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {item.flow === "IN" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {item.flow === "IN" ? "INFLOW" : "OUTFLOW"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-stone-500 font-mono text-[11px]">
                      {getPKTDateISO(item.date)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-stone-900">{item.category}</p>
                        {item.status && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              ["finished", "completed"].includes((item.status || "").toLowerCase())
                                ? "bg-emerald-100 text-emerald-800"
                                : (item.status || "").toLowerCase() === "cancelled"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">{item.note}</p>
                    </td>
                    <td className="px-6 py-3.5 text-stone-600">{item.who}</td>
                    <td className="px-6 py-3.5 text-stone-500">
                      {formatMethod(item.method, item.bankName)}
                    </td>
                    <td
                      className={`px-6 py-3.5 text-right text-sm font-semibold ${
                        item.flow === "IN" ? "text-stone-900" : "text-rose-600"
                      }`}
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
      </div>
    </div>
  );
}