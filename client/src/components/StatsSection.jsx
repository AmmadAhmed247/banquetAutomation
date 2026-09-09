import { useState, useMemo } from "react";
import { LayoutGrid, CheckCircle2, Clock, Wallet, ChevronDown, DollarSign } from "lucide-react";
import { useGetCashflow } from "../lib/hooks/cashflow.hook";

export const ADDON_PAYMENT_METHODS = [
  "Cash",
  "JazzCash",
  "EasyPaisa",
  "Habib Metro Usman",
  "Meezan Bank Sadar",
];

export default function StatsSection({ bookings = [] }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  // ── Single source of truth ───────────────────────────────────────────────
  const { data: finance } = useGetCashflow({ range: "all" });
  console.log("finance data:", finance);

  const byMethod = finance?.byMethod || {};

  // Amount for the currently selected payment method
  const filteredPaymentRevenue = byMethod[selectedPaymentMethod] || 0;

  const filteredPaymentLabel =
    filteredPaymentRevenue >= 1_000_000
      ? `PKR ${(filteredPaymentRevenue / 1_000_000).toFixed(1)}M`
      : `PKR ${(filteredPaymentRevenue / 1000).toFixed(0)}K`;

  // Booking status counts (still from bookings prop)
  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: LayoutGrid,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Finished",
      value: bookings.filter((b) => (b.status || "").toLowerCase() === "finished").length,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => (b.status || "").toLowerCase() === "confirmed").length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => (b.status || "").toLowerCase() === "pending").length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-green-100 shadow-sm flex items-center gap-3 min-w-0"
        >
          <div className={`${s.bg} p-2.5 rounded-xl shrink-0`}>
            <s.icon size={18} className={s.color} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl font-bold text-green-900 truncate">{s.value}</div>
            <div className="text-[11px] text-green-400 font-medium truncate">{s.label}</div>
          </div>
        </div>
      ))}

      {/* Payment Method Card */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-green-100 shadow-sm flex items-center gap-3 min-w-0">
        <div className="bg-green-50 p-2.5 rounded-xl shrink-0">
          <Wallet size={18} className="text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg sm:text-xl font-bold text-green-900 truncate">
            {filteredPaymentLabel}
          </div>
          <div className="relative inline-flex items-center text-[11px] text-green-400 font-medium mt-0.5 w-full">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="appearance-none bg-transparent text-green-600 font-semibold cursor-pointer focus:outline-none pr-6 w-full truncate"
            >
              {ADDON_PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="text-green-500 absolute right-1 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}