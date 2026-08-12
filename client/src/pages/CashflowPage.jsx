import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt as ReceiptIcon,
  Calendar,
  Building2,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from "lucide-react";

import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllAddons } from "../lib/hooks/addon.hook";
import { getAllExpenses } from "../lib/hooks/expense.hook";
import { getAllMonthlyExpenses } from "../lib/hooks/monthlyExpense.hook";
import { getAllDailyExpenses } from "../lib/hooks/dailyExpense.hook";

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

const isConfirmed = (b) => (b.status || "").toLowerCase() === "confirmed";
const isCancelled = (b) => (b.status || "").toLowerCase() === "cancelled";

const PAYMENT_METHODS = [
  { name: "Cash", icon: Banknote },
  { name: "Bank Transfer", icon: Building2 },
  { name: "JazzCash", icon: Smartphone },
  { name: "Easypaisa", icon: Smartphone },
];

export default function Cashflow() {
  const [range, setRange] = useState("today");
  const getTodayISO = () => new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(getTodayISO());

  const { data: rawBookings } = getAllBookings() || {};
  const bookings = Array.isArray(rawBookings) ? rawBookings : rawBookings?.data || [];

  const { data: rawAddons } = getAllAddons() || {};
  const addons = Array.isArray(rawAddons) ? rawAddons : rawAddons?.data || [];

  const { data: rawExpenses } = getAllExpenses() || {};
  const expenses = Array.isArray(rawExpenses) ? rawExpenses : rawExpenses?.data || [];

  const { data: rawMonthly } = getAllMonthlyExpenses() || {};
  const monthlyExpenses = Array.isArray(rawMonthly) ? rawMonthly : rawMonthly?.data || [];

  const { data: rawDaily } = getAllDailyExpenses() || {};
  const dailyExpenses = Array.isArray(rawDaily) ? rawDaily : rawDaily?.data || [];

  const now = new Date();

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (range === "today") return isToday(dateStr);
    if (range === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (range === "custom") {
      if (!startDate || !endDate) return true;
      return d >= new Date(`${startDate}T00:00:00`) && d <= new Date(`${endDate}T23:59:59`);
    }
    return true;
  };

  const rangeLabel =
    range === "today" ? "today" : range === "month" ? "this month" : range === "all" ? "all time" : "selected range";

  const paymentsInRange = useMemo(
    () => bookings.filter((b) => inRange(b.updated_at || b.created_at) && Number(b.advance_paid) > 0),
    [bookings, range, startDate, endDate]
  );
  const advanceTotal = useMemo(() => paymentsInRange.reduce((s, b) => s + Number(b.advance_paid || 0), 0), [paymentsInRange]);

  const byMethodIn = useMemo(() => {
    const map = { Cash: 0, "Bank Transfer": 0, JazzCash: 0, Easypaisa: 0 };
    paymentsInRange.forEach((b) => {
      const method = map.hasOwnProperty(b.payment_method) ? b.payment_method : "Cash";
      map[method] += Number(b.advance_paid || 0);
    });
    return map;
  }, [paymentsInRange]);

  const addonsInRange = useMemo(() => addons.filter((a) => inRange(a.created_at)), [addons, range, startDate, endDate]);
  const addonRevenue = useMemo(() => addonsInRange.reduce((s, a) => s + Number(a.client_price || 0), 0), [addonsInRange]);
  const vendorPayout = useMemo(() => addonsInRange.reduce((s, a) => s + Number(a.vendor_cost || 0), 0), [addonsInRange]);

  const stdExpense = useMemo(
    () => expenses.filter((e) => inRange(e.created_at)).reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses, range, startDate, endDate]
  );
  const dailyExpenseTotal = useMemo(
    () => dailyExpenses.filter((d) => inRange(d.date)).reduce((s, d) => s + Number(d.amount || 0), 0),
    [dailyExpenses, range, startDate, endDate]
  );
  const monthlyOverhead = useMemo(() => {
    if (range === "all") return monthlyExpenses.reduce((s, m) => s + Number(m.amount || 0), 0);
    if (range === "month")
      return monthlyExpenses
        .filter((m) => m.year === now.getFullYear() && m.month - 1 === now.getMonth())
        .reduce((s, m) => s + Number(m.amount || 0), 0);
    if (range === "custom") {
      const s0 = new Date(startDate), e0 = new Date(endDate);
      return monthlyExpenses
        .filter((m) => {
          const md = new Date(m.year, m.month - 1, 15);
          return md >= s0 && md <= e0;
        })
        .reduce((s, m) => s + Number(m.amount || 0), 0);
    }
    return 0;
  }, [monthlyExpenses, range, startDate, endDate]);

  const totalCashIn = advanceTotal + addonRevenue;
  const totalCashOut = stdExpense + dailyExpenseTotal + monthlyOverhead + vendorPayout;
  const netCashflow = totalCashIn - totalCashOut;

  const outstandingReceivables = useMemo(() => {
    return bookings
      .filter((b) => !isCancelled(b))
      .reduce((s, b) => {
        const due = Number(b.total_amount || 0) - Number(b.advance_paid || 0);
        return s + (due > 0 ? due : 0);
      }, 0);
  }, [bookings]);

  const activityLog = useMemo(() => {
    const items = [];
    paymentsInRange.forEach((b) =>
      items.push({
        id: `advance-${b.id}`,
        time: b.updated_at || b.created_at,
        flow: "IN",
        category: "Advance Received",
        note: `${b.event || "Booking"} advance`,
        who: b.client,
        method: b.payment_method || "Cash",
        amount: Number(b.advance_paid || 0),
      })
    );
    addonsInRange.forEach((a) => {
      const booking = bookings.find((b) => b.id === a.bookingId);
      items.push({
        id: `addon-${a.id}`,
        time: a.created_at,
        flow: "IN",
        category: "Addon Revenue",
        note: a.service,
        who: booking ? booking.client : "—",
        method: "—",
        amount: Number(a.client_price || 0),
      });
      if (Number(a.vendor_cost) > 0) {
        items.push({
          id: `addon-vendor-${a.id}`,
          time: a.created_at,
          flow: "OUT",
          category: "Vendor Payout",
          note: a.service,
          who: booking ? booking.client : "—",
          method: "—",
          amount: Number(a.vendor_cost || 0),
        });
      }
    });
    expenses.filter((e) => inRange(e.created_at)).forEach((e) => {
      const booking = bookings.find((b) => b.id === e.bookingId);
      items.push({
        id: `expense-${e.id}`,
        time: e.created_at,
        flow: "OUT",
        category: e.category || "Standard Expense",
        note: e.label,
        who: booking ? booking.client : "—",
        method: "—",
        amount: Number(e.amount || 0),
      });
    });
    dailyExpenses.filter((d) => inRange(d.date)).forEach((d) =>
      items.push({
        id: `daily-${d.id}`,
        time: d.date,
        flow: "OUT",
        category: d.category || "Petty Cash",
        note: d.label,
        who: "—",
        method: "—",
        amount: Number(d.amount || 0),
      })
    );
    return items.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [paymentsInRange, addonsInRange, expenses, dailyExpenses, bookings, range, startDate, endDate]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 lg:p-10 text-stone-800 antialiased font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[#00b560] uppercase">MANAGEMENT SUITE</span>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mt-0.5">Cashflow & Revenue Ledger</h1>
        </div>

        {/* TOP FILTER PILLS */}
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

      {/* ROW 1: METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        

        {/* Total Money In */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">TOTAL MONEY IN</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00b560] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">{currency(totalCashIn)}</h2>
            <p className="text-[11px] text-stone-400 mt-2">
              {paymentsInRange.length} advances · {addonsInRange.length} add-ons
            </p>
          </div>
        </div>

        {/* Total Money Out */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">TOTAL MONEY OUT</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">{currency(totalCashOut)}</h2>
            <p className="text-[11px] text-stone-400 mt-2">
              Expenses + Vendor + Overhead
            </p>
          </div>
        </div>
        {/* Net Cashflow */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">NET CASHFLOW</span>
            <div className="w-9 h-9 rounded-xl bg-[#00b560] text-white flex items-center justify-center shadow-sm">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className={`text-2xl lg:text-3xl font-semibold tracking-tight ${netCashflow >= 0 ? "text-stone-900" : "text-rose-600"}`}>
              {netCashflow >= 0 ? "" : "-"}
              {currency(Math.abs(netCashflow))}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${netCashflow >= 0 ? "bg-emerald-50 text-[#00b560]" : "bg-rose-50 text-rose-600"}`}>
                {netCashflow >= 0 ? "Positive Flow" : "Negative Flow"}
              </span>
              <span className="text-[11px] text-stone-400">Net in {rangeLabel}</span>
            </div>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">OUTSTANDING RECEIVABLES</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ReceiptIcon size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-stone-900 tracking-tight">{currency(outstandingReceivables)}</h2>
            <p className="text-[11px] font-medium text-amber-600 mt-2">
              Uncollected client balances
            </p>
          </div>
        </div>

      </div>

      {/* ROW 2: REVENUE BREAKDOWN & PAYMENT CHANNELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-stone-900 mb-1">Revenue Breakdown</h3>
          <p className="text-[11px] text-stone-400 mb-5">Collections during {rangeLabel}</p>
          
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <span className="text-stone-500">Advance Receipts</span>
              <span className="font-semibold text-stone-900">{currency(advanceTotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <span className="text-stone-500">Add-on Sales</span>
              <span className="font-semibold text-stone-900">{currency(addonRevenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-stone-500">Total Cash Collected</span>
              <span className="font-semibold text-[#00b560]">{currency(totalCashIn)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase">Pending Receivables</p>
                <p className="text-sm font-semibold text-amber-600 mt-0.5">{currency(outstandingReceivables)}</p>
              </div>
              <span className="text-[10px] font-medium bg-amber-100/60 text-amber-700 px-2 py-1 rounded-md">
                All Bookings
              </span>
            </div>
          </div>
        </div>

        {/* Money In By Channel */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-stone-900">Money In by Payment Gateway</h3>
              <SlidersHorizontal size={14} className="text-stone-400" />
            </div>
            <p className="text-[11px] text-stone-400 mb-5">Advances categorized by settlement channel ({rangeLabel})</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const val = byMethodIn[method.name];
                const pct = totalCashIn > 0 ? Math.round((val / totalCashIn) * 100) : 0;
                return (
                  <div key={method.name} className="p-4 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-stone-200/60 flex items-center justify-center text-stone-600 shadow-2xs">
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-800">{method.name}</p>
                        <p className="text-[10px] text-stone-400">{pct}% of gross inflows</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">{currency(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-stone-400 mt-6 pt-3 border-t border-stone-100">
            Note: Vendor payouts and daily petty cash outflows are cleared directly from physical cash drawer or primary bank account.
          </p>
        </div>

      </div>

      {/* ROW 3: ACTIVITY LOG TABLE */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Cash Flow Activity Ledger</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Audit log of every transaction during {rangeLabel}</p>
          </div>
          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
            {activityLog.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-100 text-stone-400 text-[10px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Flow</th>
                <th className="px-6 py-3">Transaction / Account</th>
                <th className="px-6 py-3">Client / Payee</th>
                <th className="px-6 py-3">Gateway</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activityLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-xs">
                    No financial activity recorded for this period.
                  </td>
                </tr>
              ) : (
                activityLog.map((item) => (
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
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-stone-900">{item.category}</p>
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