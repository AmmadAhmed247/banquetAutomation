import { BOOKINGS } from "../data/mockData";

export default function DashboardOverview() {
  const stats = [
    { 
      label: "Total Clients", 
      value: "48", 
      sub: "+3 this week", 
      icon: "👥", 
      color: "emerald" 
    },
    { 
      label: "Weddings This Month", 
      value: "6", 
      sub: "2 upcoming", 
      icon: "💒", 
      color: "amber" 
    },
    { 
      label: "Messages Today", 
      value: "312", 
      sub: "via WhatsApp", 
      icon: "✉️", 
      color: "indigo" 
    },
    { 
      label: "Auto Replies", 
      value: "89", 
      sub: "this week", 
      icon: "⚡", 
      color: "rose" 
    },
  ];

  const upcoming = BOOKINGS.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Stats Cards */}
      <div className="lg:col-span-7 grid grid-cols-2 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 hover:border-emerald-200 transition-all">
            <div className="text-4xl mb-6">{stat.icon}</div>
            <div className="text-5xl font-semibold text-slate-900 mb-1">{stat.value}</div>
            <p className="text-slate-600 font-medium">{stat.label}</p>
            <p className="text-emerald-600 text-sm mt-2 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Weddings */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">Upcoming Weddings</h3>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
            Next 30 Days
          </span>
        </div>

        <div className="space-y-5">
          {upcoming.map((booking) => (
            <div key={booking.id} className="flex items-center gap-5 bg-emerald-50 rounded-2xl p-5 hover:bg-emerald-100 transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-emerald-200">
                <span className="text-xl font-bold text-emerald-700">
                  {new Date(booking.date).getDate()}
                </span>
                <span className="text-[10px] text-emerald-600 -mt-1">
                  {new Date(booking.date).toLocaleString('default', { month: 'short' })}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{booking.client}</p>
                <p className="text-sm text-slate-600">{booking.event} • {booking.package}</p>
              </div>

              <div className={`px-4 py-2 rounded-2xl text-xs font-semibold ${
                booking.status === "Confirmed" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {booking.status}
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full py-3.5 text-emerald-700 font-semibold hover:bg-emerald-50 rounded-2xl transition-all text-sm border border-emerald-200">
          View All Bookings →
        </button>
      </div>
    </div>
  );
}