import React from "react";
import {
  MessageCircle,
  Zap,
  Users,
  Calendar,
  CalendarCheck,
  Image,
  Bell,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BOOKINGS } from "../data/mockData";

export default function DashboardPage() {
  const navigate = useNavigate();

  const tools = [
    { name: "Inbox", path: "inbox", icon: MessageCircle, desc: "Manage your studio" },
    { name: "Auto Reply Bot", path: "autobot", icon: Zap, desc: "Manage your studio" },
    { name: "Contacts", path: "contacts", icon: Users, desc: "Manage your studio" },
    { name: "Calendar", path: "calendar", icon: Calendar, desc: "Manage your studio" },
    { name: "Bookings", path: "bookings", icon: CalendarCheck, desc: "Manage your studio" },
    { name: "Gallery", path: "gallery", icon: Image, desc: "Manage your studio" },
    { name: "Reminders", path: "reminders", icon: Bell, desc: "Manage your studio" },
    { name: "Settings", path: "settings", icon: Settings, desc: "Manage your studio" },
  ];

  const stats = [
    { label: "Total Clients", val: "48", trend: "+3 this week", icon: Users },
    { label: "Weddings", val: "6", trend: "2 upcoming", icon: Calendar },
    { label: "Messages", val: "312", trend: "Today", icon: MessageCircle },
    { label: "Auto Replies", val: "89", trend: "This week", icon: Zap },
  ];

  const alerts = [
    { type: "red", msg: "Ahmed & Sana Raza — Wedding in 2 days! Auto reminder queued.", action: "Send Now" },
    { type: "amber", msg: "Sara & Ali Khan — Cold drinks addon reminder due in 1 day.", action: "Send" },
    { type: "green", msg: "Fatima & Usman — Booking fully confirmed. All addons set.", action: "View" },
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-mono font-bold text-slate-900 leading-none">Darbar</h1>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">CRM</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm font-medium">Karachi • April 19, 2026</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
            <s.icon className="w-6 h-6 text-emerald-600 mb-4" />
            <h3 className="text-4xl font-bold text-slate-900 mb-1">{s.val}</h3>
            <p className="text-slate-400 text-xs font-medium mb-2">{s.label}</p>
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-tight">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"> */}
        {/* Smart Alerts */}
        {/* <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-emerald-50 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Smart Alerts</h2>
          <div className="space-y-4">
            {alerts.map((a, i) => (
              <div key={i} className={`p-4 rounded-xl ${
                a.type === "red" ? "bg-red-50" : a.type === "amber" ? "bg-amber-50" : "bg-green-50"
              }`}>
                <p className="text-sm text-slate-700">{a.msg}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Upcoming Weddings */}
        {/* <div className="bg-white p-8 rounded-[32px] border border-emerald-50 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Upcoming Weddings</h2>
          <div className="space-y-3">
            {BOOKINGS?.slice(0, 4).map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{b.client || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{b.date || "TBD"}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      {/* </div> */}

      {/* Tools Grid */}
      <h2 className="text-lg font-bold text-slate-800 mb-8">Studio Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.path}
            onClick={() => navigate(`/${tool.path}`)}
            className="group bg-white p-8 rounded-[32px] border border-emerald-50 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all text-left"
          >
            <tool.icon className="w-7 h-7 text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-slate-900 mb-1">{tool.name}</h4>
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-tighter">{tool.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}