import { LayoutGrid, CheckCircle2, Clock, Wallet } from "lucide-react";

export default function StatsSection({ bookings }) {
  const revenue = bookings.reduce((a, b) => a + Number(b.totalAmount || 0), 0);
  const revenueLabel =
    revenue >= 1000000
      ? `PKR ${(revenue / 1000000).toFixed(1)}M`
      : `PKR ${(revenue / 1000).toFixed(0)}K`;

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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
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
    </div>
  );
}