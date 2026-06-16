import React from "react";
import {
  MessageCircle,
  Zap,
  Users,
  Calendar,
  CalendarCheck,
  ReceiptIcon,
  DollarSign,
  LogOut // Imported LogOut icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Imported axios for the backend call
import api from "../api/api"
export default function DashboardPage() {
  const navigate = useNavigate();
  
  // FIXED paths: Since this page is loaded inside the /dashboard layout, 
  // navigating to sub-routes should just be relative paths like "contacts" instead of "dashboard/contacts"
  const tools = [
    { name: "Contacts", path: "contacts", icon: Users, desc: "Manage your studio" },
    { name: "Calendar", path: "calendar", icon: Calendar, desc: "Manage your studio" },
    { name: "Bookings", path: "bookings", icon: CalendarCheck, desc: "Manage your studio" },
    { name: "Receipt", path: "recipt", icon: ReceiptIcon, desc: "Manage your studio" },
    { name: "Management System", path: "management", icon: DollarSign, desc: "Manage your studio" },
  ];

  const stats = [
    { label: "Total Clients", val: "48", trend: "+3 this week", icon: Users },
    { label: "Weddings", val: "6", trend: "2 upcoming", icon: Calendar },
    { label: "Messages", val: "312", trend: "Today", icon: MessageCircle },
    { label: "Auto Replies", val: "89", trend: "This week", icon: Zap },
  ];


  const handleLogout = async () => {
    try {
     
      await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true, 
      });
    } catch (error) {
      console.error("Logout API failed, forcing redirect anyway...", error);
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* Header section with Logout Button */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-mono font-bold text-slate-900 leading-none">Darbar</h1>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">CRM</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-slate-400 text-sm font-medium">{new Date().toLocaleString()}</p>
          </div>
          
          {/* Modern Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-100 hover:border-red-100 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
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

      {/* Tools Grid */}
      <h2 className="text-lg font-bold text-slate-800 mb-8">Studio Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.path}
            onClick={() => navigate(`${tool.path}`)} // FIXED: Cleaned up interpolation
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