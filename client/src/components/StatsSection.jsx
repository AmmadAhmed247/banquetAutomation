import { useState } from "react";
import { LayoutGrid, CheckCircle2, Clock, Wallet, ChevronDown } from "lucide-react";

export default function StatsSection({ bookings }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  const revenue = bookings.reduce((a, b) => a + Number(b.totalAmount || 0), 0);
  const revenueLabel =
    revenue >= 1000000
      ? `PKR ${(revenue / 1000000).toFixed(1)}M`
      : `PKR ${(revenue / 1000).toFixed(0)}K`;

  // Calculate revenue filtered by the selected payment method or bank safely and exclusively
  const filteredPaymentRevenue = bookings
    .filter((b) => {
      const method = (b.paymentMethod || "").toLowerCase();
      const bank = (b.bankName || "").toLowerCase();
      const target = selectedPaymentMethod.toLowerCase();

      const isHabib = method.includes("habib") || method.includes("hbl") || bank.includes("habib") || bank.includes("hbl") || bank.includes("metro");
      const isCash = method.includes("cash") || (!method && !bank);
      const isJazzCash = method.includes("jazz") || bank.includes("jazz");
      const isEasyPaisa = method.includes("easy") || bank.includes("easy");

      if (target === "habib") return isHabib;
      if (target === "cash") return isCash;
      if (target === "jazzcash") return isJazzCash;
      if (target === "easypaisa") return isEasyPaisa;
      
      if (target === "bank") {
        // Exclude all specific known types so "Other Bank" only grabs true outliers
        return !isHabib && !isCash && !isJazzCash && !isEasyPaisa && (method || bank);
      }

      return method.includes(target) || bank.includes(target);
    })
    .reduce((a, b) => a + Number(b.totalAmount || 0), 0);

  const filteredPaymentLabel =
    filteredPaymentRevenue >= 1000000
      ? `PKR ${(filteredPaymentRevenue / 1000000).toFixed(1)}M`
      : `PKR ${(filteredPaymentRevenue / 1000).toFixed(0)}K`;

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: LayoutGrid,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Confirmed",
      value: bookings.filter((b) => b.status === "Confirmed").length,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "Pending").length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Total Revenue",
      value: revenueLabel,
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
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

      {/* ── Dynamic Payment Method KPI Card ── */}
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
              <option value="Cash">Cash</option>
              <option value="Habib">Habib Metro</option>
              <option value="JazzCash">JazzCash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Bank">Other Bank</option>
            </select>
            <ChevronDown size={12} className="text-green-500 absolute right-1 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}