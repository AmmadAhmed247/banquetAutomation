import { LayoutGrid, CheckCircle2, Clock, Wallet } from "lucide-react";

export default function StatsSection({ bookings }) {
  const stats = [
    { 
      label: "Total Bookings", 
      value: bookings.length, 
      icon: LayoutGrid, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Confirmed", 
      value: bookings.filter(b => b.status === "Confirmed").length, 
      icon: CheckCircle2, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Pending", 
      value: bookings.filter(b => b.status === "Pending").length, 
      icon: Clock, 
      color: "text-amber-500", 
      bg: "bg-amber-50" 
    },
    { 
      label: "Total Revenue", 
      value: "PKR " + (bookings.reduce((a, b) => a + Number(b.totalAmount || 0), 0) / 1000000).toFixed(4) + "M", 
      icon: Wallet, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm flex items-center gap-4">
          <div className={`${s.bg} p-3 rounded-xl`}>
            <s.icon size={20} className={s.color} />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-900">{s.value}</div>
            <div className="text-xs text-green-400 font-medium">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
