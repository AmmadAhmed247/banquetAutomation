import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarCheck,
  ReceiptIcon,
  DollarSign,
  LogOut,
  BanknoteArrowDown ,

} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tools = [
    { name: "Calendar", path: "calendar", icon: Calendar },
    { name: "Bookings", path: "bookings", icon: CalendarCheck },
    { name: "Receipt", path: "recipt", icon: ReceiptIcon },
    { name: "Management System", path: "management", icon: DollarSign },
    { name: "Expense", path: "expense", icon: BanknoteArrowDown },
  ];

  // UPDATED: Check if they are on the main dashboard page
  const isOnDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  return (
    <div className="flex h-screen bg-[#fcfdfd] overflow-hidden font-sans">
      {!isOnDashboard && (
        <aside className="w-24 bg-white border-r border-emerald-50 flex flex-col items-center py-6 animate-in slide-in-from-left duration-500">
          {/* UPDATED: Navigates back to main dashboard view */}
          <button
            onClick={() => navigate("/dashboard")} 
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
            {tools.map((t) => {
              // UPDATED: Create absolute path for comparison and navigation
              const fullPath = `/dashboard/${t.path}`;
              const isActive = location.pathname === fullPath;

              return (
                <button
                  key={t.path}
                  onClick={() => navigate(fullPath)} // UPDATED
                  className="group relative flex items-center justify-center"
                >
                  <div
                    className={`
                      p-3.5 rounded-2xl transition-all duration-300
                      ${isActive
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-110"
                        : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                      }
                    `}
                  >
                    <t.icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>

                  <span className="absolute left-20 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50 uppercase tracking-widest">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50 w-full flex flex-col items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-300 uppercase">
              Live
            </span>
            <button
              onClick={handleLogout}
              className="group relative flex items-center justify-center w-full"
              title="Logout"
            >
              <div className="p-3.5 rounded-2xl transition-all duration-300 text-slate-400 hover:bg-red-50 hover:text-red-600 w-12 h-12 flex items-center justify-center">
                <LogOut size={22} strokeWidth={2} />
              </div>
              <span className="absolute left-20 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50 uppercase tracking-widest">
                Logout
              </span>
            </button>
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