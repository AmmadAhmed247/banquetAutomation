import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt as ReceiptIcon,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";

import { getAllBookings } from "../lib/hooks/booking.hook";
import { useGetCashflow } from "../lib/hooks/cashflow.hook"; 

const currency = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

const getPKTDateISO = (dateInput) => {
  let d = dateInput || new Date();
  
  if (typeof d === "string" && d.trim().length === 7) {
    d = `${d.trim()}-01`;
  }

  const parsedDate = typeof d === "string" ? new Date(d) : d;
  if (isNaN(parsedDate.getTime())) return "";

  const pktDate = new Date(parsedDate.getTime() + 5 * 60 * 60 * 1000);
  return `${pktDate.getUTCFullYear()}-${String(pktDate.getUTCMonth() + 1).padStart(2, "0")}-${String(pktDate.getUTCDate()).padStart(2, "0")}`;
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

  // Single source of truth — passing range so backend knows when to fetch all history
  const cashflowQuery = useGetCashflow({ 
    start: range === "all" ? "" : queryStart, 
    end: range === "all" ? "" : queryEnd, 
    range 
  });
  const cashflowData = cashflowQuery?.data;

  // Still need raw bookings just for the receivables card
  const bookingsQuery = getAllBookings();
  const isLoading = cashflowQuery.isLoading || bookingsQuery.isLoading;
  const extractArray = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.bookings)) return raw.bookings;
    return [];
  };
  const bookings = useMemo(() => extractArray(bookingsQuery?.data), [bookingsQuery?.data]);

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

  const totalIn = cashflowData?.totalIn || 0;
  const totalOut = cashflowData?.totalOut || 0;
  const net = cashflowData?.net || 0;
  const paymentBoxes = [
    { label: "Cash Received", key: "Cash", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Meezan Bank", key: "Meezan Bank Sadar", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Habib Metro", key: "Habib Metro Usman", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "JazzCash", key: "JazzCash", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "EasyPaisa", key: "EasyPaisa", color: "text-lime-600", bg: "bg-lime-50" },
    
  ];

  const mergedActivity = useMemo(() => {
    const activity = cashflowData?.activity || [];
    return activity.map((item) => ({
      id: item.id,
      flow: item.flow,
      category: item.category,
      note: item.note,
      who: item.who || "—",
      method: formatMethod(item.method),
      amount: item.amount,
      date: item.time,
    }));
  }, [cashflowData]);

  const rangeLabel =
    range === "today"
      ? "today"
      : range === "month"
      ? "this month"
      : range === "all"
      ? "all time"
      : "selected range";


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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {paymentBoxes.map((box) => (
          <div key={box.key} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${box.bg} ${box.color} flex items-center justify-center`}>
                <Wallet size={14} />
              </div>
              <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
                {box.label}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight mt-3">
              {currency(cashflowData?.byMethod?.[box.key] || 0)}
            </h2>
            <p className="text-[10px] text-stone-400 mt-1">Received ({rangeLabel})</p>
          </div>
        ))}
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