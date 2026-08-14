import React from "react";
import {
  MessageCircle,
  Zap,
  Users,
  Calendar,
  CalendarCheck,
  ReceiptIcon,
  DollarSign,
  LogOut,
  BanknoteArrowDown,
  FolderKanban 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import StudioHeader from "../components/StudioHeader";
export default function DashboardPage() {
  const navigate = useNavigate();

  const tools = [
    { name: "Calendar", path: "calendar", icon: Calendar, desc: "Manage your studio" },
    { name: "Bookings", path: "bookings", icon: CalendarCheck, desc: "Manage your studio" },
    { name: "Receipt", path: "recipt", icon: ReceiptIcon, desc: "Manage your studio" },
    { name: "Management System", path: "management", icon: FolderKanban, desc: "Manage your studio" },
    { name: "Add-ons", path: "addons", icon: BanknoteArrowDown, desc: "Manage your studio" },
    { name: "Cash Flow", path: "cash-flow", icon: DollarSign, desc: "Manage your studio" },
  ];

  const handleLogout = async () => {
    try {
      await api.post(`/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout API failed, forcing redirect anyway...", error);
    } finally {
      navigate("/");
    }
  };

  return (
    // Clean, high-end off-white background
    <div className="relative min-h-screen w-full bg-[#f8fafc] text-slate-900">
      
      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* Modern Glass Header */}
        <div className="flex justify-between items-center mb-16 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="relative">
                <h1 className="relative text-4xl font-mono font-bold text-slate-900 tracking-tighter">Darbar</h1>
                <span className="absolute -bottom-2 left-0 text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em]">CRM</span>
                
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden lg:block text-right">
  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">
    System Status: Online
  </p>
  
  {/* Gregorian Date */}
  <p className="text-slate-900 text-sm font-medium">
    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
  </p>

  {/* Custom Formatted Islamic Date */}
  <p className="text-slate-500 text-xs font-medium mt-0.5">
    {(() => {
      // 1. Custom transliterated month names
      const hijriMonths = [
        "Muharram", "Safar", "Rabbi Ul Awwal", "Rabbi Ul Akhir",
        "Jumada Al Ula", "Jumada Al Akhirah", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu Al Qi'dah", "Dhu Al Hijjah"
      ];

      // 2. Extract numeric day, month index, and year
      const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });

      const parts = Object.fromEntries(
        formatter.formatToParts(new Date()).map(p => [p.type, p.value])
      );

      const day = parts.day;
      const monthName = hijriMonths[parseInt(parts.month, 10) - 1];
      const year = parts.year;

      return `${day} ${monthName} ${year} AH`;
    })()}
  </p>


</div>
            
            <button 
              onClick={handleLogout}
              className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Studio Tools</h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool) => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group relative h-64 bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
            >
              {/* Subtle hover gradient corner */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all duration-500">
                  <tool.icon className="w-7 h-7 text-emerald-600" />
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{tool.name}</h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[150px]">{tool.desc}</p>
                </div>
              </div>

              {/* Elegant Accent Line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}