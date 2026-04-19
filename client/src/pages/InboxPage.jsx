import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, Image, Briefcase, Bell, GlassWater, 
  Search, Send, CheckCircle2, MoreVertical, Phone, Video
} from "lucide-react";
import { CONTACTS, INIT_THREADS } from "../data/mockData";

export default function InboxPage({ showToast }) {
  const [sel, setSel] = useState(CONTACTS[0]);
  const [threads, setThreads] = useState(INIT_THREADS);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const endRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sel, threads]);

  const filteredContacts = CONTACTS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (overrideMsg = null) => {
    const messageText = typeof overrideMsg === 'string' ? overrideMsg : input;
    if (!messageText.trim()) return;

    setThreads(prev => ({
      ...prev,
      [sel.id]: [...(prev[sel.id] || []), { 
        from: "me", 
        text: messageText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]
    }));

    if (!overrideMsg) setInput("");
    if (showToast) showToast("Message sent successfully");
  };

  const quickReplies = [
    { id: 1, icon: <Calendar size={14} />, color: "text-emerald-600", label: "Calendar", msg: "Here is our booking calendar: https://cal.com/darbar" },
    { id: 2, icon: <Image size={14} />, color: "text-blue-600", label: "Gallery", msg: "Check out our portfolio: https://darbar.studio/gallery" },
    { id: 3, icon: <Briefcase size={14} />, color: "text-purple-600", label: "Packages", msg: "Our packages start from Rs. 50,000. Should I send the PDF?" },
    { id: 4, icon: <Bell size={14} />, color: "text-amber-600", label: "2-Day Reminder", msg: "Hi! Just a reminder that your event is in 2 days." },
    { id: 5, icon: <GlassWater size={14} />, color: "text-pink-600", label: "Addons", msg: "Would you like to add cold drinks or floral arrangements? Reply YES!" },
  ];

  return (
    // 1. Root Container: h-screen ensures full height like WhatsApp
    <div className="flex h-screen w-full bg-white overflow-hidden">
      
      {/* --- LEFT SIDEBAR: CONTACTS (FIXED WIDTH) --- */}
      <aside className="w-80 flex flex-col border-r border-emerald-50 shrink-0 bg-white">
        {/* Fixed Header in Sidebar */}
        <div className="p-6 border-b border-emerald-50 shrink-0 bg-emerald-50/10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Conversations</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
              placeholder="Search clients..."
            />
          </div>
        </div>
        <div className="flex-1 no-scrollbar">
          {filteredContacts.map(c => (
            <button 
              key={c.id} 
              onClick={() => setSel(c)} 
              className={`w-full flex items-center gap-4 px-6 py-4 border-b border-slate-50 transition-all relative
                ${sel.id === c.id ? "bg-emerald-50/50" : "hover:bg-slate-50"}`}
            >
              {sel.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />}
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 shrink-0 shadow-sm">
                {c.avatar}
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-500 truncate">{c.lastMsg || "Tap to chat"}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 flex flex-col h-screen min-w-0 bg-[#fcfdfd] overflow-hidden">
        
        {/* CHAT HEADER (FIXED - WITH QUICK REPLIES) */}
        <header className="px-8 py-5 border-b border-emerald-50 flex flex-col gap-3 shrink-0 bg-white shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-900/10">
                {sel.avatar}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-none mb-1">{sel.name}</h3>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-tighter">{sel.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Phone size={18}/></button>
               <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Video size={18}/></button>
               <div className="w-[1px] h-6 bg-slate-100 mx-1" />
               <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Active
               </span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quickReplies.map((q) => (
              <button 
                key={q.id} 
                onClick={() => handleSend(q.msg)}
                className="group flex items-center gap-2 px-4 py-2 border border-emerald-100 bg-white rounded-xl text-[11px] font-bold text-slate-600 hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap shadow-sm active:scale-95"
              >
                <span className={`${q.color} group-hover:text-white transition-colors`}>{q.icon}</span> 
                {q.label}
              </button>
            ))}
          </div>
        </header>

        {/* --- MESSAGES AREA (THE ONLY SCROLLABLE PART) --- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-emerald-50/20 scroll-smooth">
          {(threads[sel.id] || []).map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className={`px-5 py-3.5 rounded-[22px] text-[13.5px] shadow-sm leading-relaxed ${
                  m.from === "me" 
                    ? "bg-emerald-600 text-white rounded-br-none shadow-emerald-900/10" 
                    : "bg-white border border-emerald-100 text-slate-700 rounded-bl-none"
                }`}>
                  {m.text}
                </div>
                <p className={`text-[9px] mt-2 font-black text-slate-300 uppercase tracking-tighter ${m.from === "me" ? "text-right" : "text-left"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* FOOTER (FIXED - RED LINE 3) */}
        <footer className="p-6 border-t border-emerald-50 bg-white shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-[24px] focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500/30 transition-all shadow-inner">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              rows="1"f
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none resize-none max-h-32 text-slate-700 scrollbar-hide" 
              placeholder={`Message ${sel.name.split(' ')[0]}...`}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={() => handleSend()} 
              className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3 font-medium uppercase tracking-widest">WhatsApp Business API Enabled</p>
        </footer>

      </section>
    </div>
  );
}