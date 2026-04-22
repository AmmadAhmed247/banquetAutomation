import React, { useState } from "react";
import {
  LayoutDashboard, MessageCircle, Zap, Users, Calendar,
  CalendarCheck, Image, Bell, Settings, ArrowBigLeft
} from "lucide-react";

import InboxPage from "./pages/InboxPage";
import AutoBotPage from "./pages/AutoBotPage";
import ContactsPage from "./pages/ContactsPage";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import GalleryPage from "./pages/GalleryPage";
import RemindersPage from "./pages/RemindersPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");


  const tools = [
    { name: "Inbox", id: "inbox", icon: MessageCircle, desc: "Manage your studio" },
    { name: "Auto Reply Bot", id: "autobot", icon: Zap, desc: "Manage your studio" },
    { name: "Contacts", id: "contacts", icon: Users, desc: "Manage your studio" },
    { name: "Calendar", id: "calendar", icon: Calendar, desc: "Manage your studio" },
    { name: "Bookings", id: "bookings", icon: CalendarCheck, desc: "Manage your studio" },
    { name: "Gallery", id: "gallery", icon: Image, desc: "Manage your studio" },
    { name: "Reminders", id: "reminders", icon: Bell, desc: "Manage your studio" },
    { name: "Settings", id: "settings", icon: Settings, desc: "Manage your studio" },
  ];


  const stats = [
    { label: "Total Clients", val: "48", trend: "+3 this week", icon: Users },
    { label: "Weddings", val: "6", trend: "2 upcoming", icon: Calendar },
    { label: "Messages", val: "312", trend: "Today", icon: MessageCircle },
    { label: "Auto Replies", val: "89", trend: "This week", icon: Zap },
  ];


  const renderContent = () => {
    switch (activePage) {
      case "inbox": return <InboxPage />;
      case "autobot": return <AutoBotPage />;
      case "contacts": return <ContactsPage />;
      case "calendar": return <CalendarPage />;
      case "bookings": return <BookingsPage />;
      case "gallery": return <GalleryPage />;
      case "reminders": return <RemindersPage />;
      case "settings": return <SettingsPage />;
      default: return <MainDashboardHub />;
    }
  };


  function MainDashboardHub() {
    return (
      <div className="p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl  font-mono font-bold text-slate-900 leading-none">Darbar</h1>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">CRM</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm font-medium">Karachi • April 19, 2026</p>
          </div>
        </div>
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


        <h2 className="text-lg font-bold text-slate-800 mb-8 ml-2">Studio Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActivePage(tool.id)}
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

  return (
    <div className="flex h-screen bg-[#fcfdfd] overflow-hidden font-sans">
      {activePage !== "dashboard" && (
        <aside className="w-24 bg-white border-r border-emerald-50 flex flex-col items-center py-6 animate-in slide-in-from-left duration-500">

          <button
            onClick={() => setActivePage("dashboard")}
            className="group flex flex-col items-center gap-1 mb-10 transition-all hover:scale-105"
          >
            <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:bg-green-600 transition-colors">
              <LayoutDashboard size={22} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Main</span>
          </button>

          {/* Vertical Tool Divider */}
          <div className="w-8 h-[1px] bg-slate-100 mb-8" />

          {/* Nav Items */}
          <nav className="flex flex-col gap-6 flex-1">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setActivePage(t.id)}
                className="group relative flex items-center justify-center"
              >
                <div className={`
              p-3.5 rounded-2xl transition-all duration-300
              ${activePage === t.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-110'
                    : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}
            `}>
                  <t.icon size={22} strokeWidth={activePage === t.id ? 2.5 : 2} />
                </div>

                <span className="absolute left-20 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50 uppercase tracking-widest">
                  {t.name}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50 w-full flex flex-col items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-slate-300 uppercase">Live</span>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}