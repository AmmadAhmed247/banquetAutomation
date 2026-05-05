import React from "react";
import {
  LayoutDashboard,
  MessageCircle,
  Zap,
  Users,
  Calendar,
  CalendarCheck,
  Image,
  Bell,
  Settings,
  ReceiptIcon
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tools = [
    // { name: "Inbox", path: "inbox", icon: MessageCircle },
    // { name: "Auto Reply Bot", path: "autobot", icon: Zap },
    { name: "Contacts", path: "contacts", icon: Users },
    { name: "Calendar", path: "calendar", icon: Calendar },
    { name: "Bookings", path: "bookings", icon: CalendarCheck },
    { name: "Receipt", path: "recipt", icon: ReceiptIcon },
    // { name: "Gallery", path: "gallery", icon: Image },
    // { name: "Reminders", path: "reminders", icon: Bell },
    // { name: "Settings", path: "settings", icon: Settings },
  ];

  const isOnDashboard = location.pathname === "/";

  return (
    <div className="flex h-screen bg-[#fcfdfd] overflow-hidden font-sans">
      {!isOnDashboard && (
        <aside className="w-24 bg-white border-r border-emerald-50 flex flex-col items-center py-6 animate-in slide-in-from-left duration-500">
          <button
            onClick={() => navigate("/")}
            className="group flex flex-col items-center gap-1 mb-10 transition-all hover:scale-105"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:bg-green-600 transition-colors">
              <LayoutDashboard size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Main
            </span>
          </button>

          <div className="w-8 h-[1px] bg-slate-100 mb-8" />

          <nav className="flex flex-col gap-6 flex-1">
            {tools.map((t) => (
              <button
                key={t.path}
                onClick={() => navigate(`/${t.path}`)}
                className="group relative flex items-center justify-center"
              >
                <div
                  className={`
              p-3.5 rounded-2xl transition-all duration-300
              ${
                location.pathname === `/${t.path}`
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-110"
                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
              }
            `}
                >
                  <t.icon
                    size={22}
                    strokeWidth={location.pathname === `/${t.path}` ? 2.5 : 2}
                  />
                </div>

                <span className="absolute left-20 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50 uppercase tracking-widest">
                  {t.name}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50 w-full flex flex-col items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-300 uppercase">
              Live
            </span>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
