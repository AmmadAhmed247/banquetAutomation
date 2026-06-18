import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  CalendarClock,
  Ticket,
  Bell,
  Receipt,
  PhoneCall,
} from "lucide-react";

// ── Offer card ───────────────────────────────────────────────────────────────
function OfferCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-3">
        <Icon size={20} strokeWidth={2} />
      </div>
      <h3 className="font-display text-[15px] font-semibold text-gray-900 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const offers = [
    {
      icon: MessageCircle,
      title: "Custom WhatsApp Chatbot",
      desc: "A smart chatbot tailored to your business — answers questions, qualifies leads, and handles conversations like your team.",
    },
    {
      icon: CalendarClock,
      title: "Automated Reminders",
      desc: "Never miss an appointment or deadline. Send timely reminders so customers always show up prepared.",
    },
    {
      icon: Ticket,
      title: "Booking & Order Confirmations",
      desc: "Instant confirmations the moment a booking or order is placed, with all necessary details.",
    },
    {
      icon: Receipt,
      title: "Digital Receipts & Invoices",
      desc: "Send professional itemized receipts and invoices directly via WhatsApp.",
    },
    {
      icon: PhoneCall,
      title: "Outreach & Follow-ups",
      desc: "Re-engage past customers and nurture new leads with timely offers and availability updates.",
    },
    {
      icon: Bell,
      title: "Status Updates",
      desc: "Keep customers informed about order status, service progress, payments, and important changes.",
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp .6s ease forwards; }
        .wavy-line { background: repeating-linear-gradient(90deg, #22c55e 0 8px, transparent 8px 14px); height: 3px; border-radius: 2px; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[18px] font-bold text-gray-900 tracking-tight"><img className="w-30" src="2ndLogo.png" alt="" /></span>
          </div> 
          <div className="flex items-center gap-3">
            <Link to={"/login"} className="text-[13px] font-medium text-gray-600 hover:text-green-600 transition-colors">
              Login
            </Link>
            <a href="#offerings" className="bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
              What We Offer
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 text-[12px] font-semibold px-3.5 py-1.5 rounded-full mb-6">
          <MessageCircle size={14} />
          WhatsApp Automation for Business
        </div>

        <h1 className="font-display text-[42px] lg:text-[56px] font-extrabold text-gray-900 leading-[1.1] mb-4 tracking-tight">
          Run your business
          <span className="block text-green-600">on WhatsApp</span>
        </h1>

        <div className="wavy-line w-16 mx-auto mb-6" />

        <p className="text-[15px] text-gray-500 leading-relaxed max-w-lg mx-auto">
          We build a custom WhatsApp chatbot for your business — handling inquiries, bookings, 
          reminders, payments, and follow-ups automatically.
        </p>
      </section>

      {/* ── Offerings ── */}
      <section id="offerings" className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-2">What We Offer</p>
          <h2 className="font-display text-[28px] font-bold text-gray-900 tracking-tight">
            One chatbot, built around your business
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => (
            <OfferCard key={o.title} {...o} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-green-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-between items-center gap-3 text-[12px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-display text-[14px] font-bold text-gray-800 tracking-tight">Raabta</span>
          </div>
          <p>© 2026 Raabta. WhatsApp automation for modern businesses.</p>
        </div>
      </footer>
    </div>
  );
}