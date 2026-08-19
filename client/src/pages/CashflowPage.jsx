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

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

// Formats YYYY-MM-DD directly in Asia/Karachi time zone
const getPKTDateISO = (dateInput = new Date()) => {
  if (!dateInput) return "";
  let d = dateInput;

  // YYYY-MM format support (e.g. "2026-08" -> "2026-08-01")
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

  // Note: previously also called useGetCashflow(...) here for a backend-computed
  // totalIn/totalOut, but that value was never used — totals below are computed
  // entirely from mergedActivity so the cards and the ledger table can never
  // contradict each other. Removed the call since it was a wasted network request.

  const bookingsQuery = getAllBookings();
  const expensesQuery = getAllExpenses();
  const addonsQuery = getAllAddons();
  const dailyQuery = getAllDailyExpenses();
  const monthlyQuery = getAllMonthlyExpenses();

  const extractArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.expenses)) return raw.expenses;
    if (Array.isArray(raw?.dailyExpenses)) return raw.dailyExpenses;
    if (Array.isArray(raw?.monthlyExpenses)) return raw.monthlyExpenses;
    if (Array.isArray(raw?.addons)) return raw.addons;
    return [];
  };

  const bookings = useMemo(() => extractArray(bookingsQuery?.data), [bookingsQuery?.data]);
  const expenses = useMemo(() => extractArray(expensesQuery?.data), [expensesQuery?.data]);
  const addons = useMemo(() => extractArray(addonsQuery?.data), [addonsQuery?.data]);
  const dailyExpenses = useMemo(() => extractArray(dailyQuery?.data), [dailyQuery?.data]);
  const monthlyExpenses = useMemo(() => extractArray(monthlyQuery?.data), [monthlyQuery?.data]);

  const isWithinRange = (dateStr) => {
    if (!dateStr || range === "all") return true;
    const recordPKTDate = getPKTDateISO(dateStr);
    if (!recordPKTDate) return false;
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
        const due = Number(b.total_amount || 0) - Number(b.advance_paid || 0);
        return s + (due > 0 ? due : 0);
      }, 0);
  }, [bookings]);

  const mergedActivity = useMemo(() => {
    const items = [];

    // 1. Bookings Activity
    bookings.forEach((b) => {
      const st = (b?.status || "").toLowerCase();
      // Cancelled bookings are NOT excluded here. Advances are non-refundable in
      // this business, so cash already collected on a booking that later gets
      // cancelled still counts as real revenue and must stay in the ledger.
      // (Cancelled bookings ARE still excluded from outstandingReceivables above,
      // since there's no future balance to expect from a dead booking.)

      const createdDate = b.created_at || b.createdAt || b.date;
      const updatedDate = b.updated_at || b.updatedAt || b.date || createdDate;

      const totalAmount = Number(b.total_amount || 0);
      const advancePaid = Number(b.advance_paid || 0);
      const isFinished = st === "finished" || st === "completed";

      if (advancePaid > 0 && isWithinRange(createdDate)) {
        items.push({
          id: `booking-adv-${b._id || b.id}`,
          flow: "IN",
          category: "Booking Advance",
          note: `${b.event || "Booking"} (Advance Payment)`,
          who: b.client_name || b.client || "—",
          method: b.payment_method || "Cash",
          amount: advancePaid,
          status: b.status,
          date: createdDate,
        });
      }

      if (isFinished) {
        const remainingBalance = Math.max(0, totalAmount - advancePaid);
        if (remainingBalance > 0 && isWithinRange(updatedDate)) {
          items.push({
            id: `booking-final-${b._id || b.id}`,
            flow: "IN",
            category: "Event Final Settlement",
            note: `${b.event || "Booking"} (Remaining Balance Cleared)`,
            who: b.client_name || b.client || "—",
            method: b.payment_method || "Cash",
            amount: remainingBalance,
            status: b.status,
            date: updatedDate,
          });
        }
      }
    });

    // 2. Add-ons Activity
    addons.forEach((a) => {
  if (!a.received) return;
  const recordDate = a.received_at || a.receivedAt || a.created_at || a.createdAt || a.date;
  if (!isWithinRange(recordDate)) return;

  const clientVal = Number(a.client_price || a.price || 0);
  const vendorVal = Number(a.vendor_cost || 0);

  if (clientVal > 0) {
    items.push({
      id: `addon-in-${a._id || a.id}`,
      flow: "IN",
      category: "Add-on Service",
      note: a.service || a.title || "Addon Service",
      who: a.client_name || "—",
      method: a.payment_method || "Cash",
      amount: clientVal,
      date: recordDate,
    });
  }

  if (vendorVal > 0) {
    items.push({
      id: `addon-out-${a._id || a.id}`,
      flow: "OUT",
      category: "Vendor Payment",
      note: `Vendor Payout (${a.service || "Addon"})`,
      who: a.vendor_name || "Vendor",
      method: "Cash",
      amount: vendorVal,
      date: recordDate,
    });
  }
});

    // 3. Standard Expenses (booking-tied)
    expenses.forEach((e) => {
      const recordDate =
        e.bill_date || e.month || e.created_at || e.createdAt || e.date || e.entry_date;

      if (!isWithinRange(recordDate)) return;

      const cat = (e.category || e.type || e.bill_type || "").toLowerCase();
      const label = (e.label || e.title || e.name || e.description || "").toLowerCase();

      const isCommission = cat.includes("commission") || label.includes("commission");

      const amt = Number(
        e.amount ?? e.bill_amount ?? e.cost ?? e.total ?? e.expense_amount ?? 0
      );

      const unitsText = e.units ? ` (${e.units} units)` : "";
      const baseNote = e.label || e.title || e.name || e.description || "Expense Outflow";
      const noteText = `${baseNote}${unitsText}`;

      items.push({
        id: `expense-${e._id || e.id}`,
        flow: "OUT",
        category: isCommission ? "Agent Commission" : e.category || "Standard Expense",
        note: noteText,
        who: e.payee || e.vendor || e.agent_name || "—",
        method: e.payment_method || "Cash",
        amount: amt,
        date: recordDate,
      });
    });

    // 4. Daily Petty Cash
    dailyExpenses.forEach((d) => {
      const recordDate = d.created_at || d.createdAt || d.date;
      if (!isWithinRange(recordDate)) return;

      const amt = Number(d.amount ?? d.cost ?? d.expense_amount ?? 0);

      items.push({
        id: `daily-${d._id || d.id}`,
        flow: "OUT",
        category: "Petty Cash",
        note: d.label || d.title || d.category || "Daily Expense",
        who: d.recorded_by || "—",
        method: "Cash",
        amount: amt,
        date: recordDate,
      });
    });

    // 5. Monthly Overhead / Recurring Bills
    monthlyExpenses.forEach((m) => {
      const recordDate = m.created_at || m.createdAt;
      if (!isWithinRange(recordDate)) return;

      const amt = Number(m.amount ?? 0);
      const billingPeriod =
        m.month && m.year
          ? new Date(Number(m.year), Number(m.month) - 1, 1).toLocaleDateString("en-PK", {
              month: "long",
              year: "numeric",
            })
          : null;

      items.push({
        id: `monthly-${m._id || m.id}`,
        flow: "OUT",
        category: "Monthly Overhead",
        note: `${m.label || m.category || "Recurring Expense"}${billingPeriod ? ` · ${billingPeriod}` : ""}`,
        who: "—",
        method: "Cash",
        amount: amt,
        date: recordDate,
      });
    });

    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [bookings, addons, expenses, dailyExpenses, monthlyExpenses, queryStart, queryEnd, range]);

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
              Audit log of payments, overheads & expenses ({rangeLabel})
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
                              (item.status || "").toLowerCase() === "finished" ||
                              (item.status || "").toLowerCase() === "completed"
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
                    <td className="px-6 py-3.5 text-stone-500">{item.method}</td>
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