import { useState, useEffect } from "react";

// ── Floating WhatsApp bubble animation ──────────────────────────────────────
function WaBubble({ delay, top, left, text, align = "left" }) {
  return (
    <div
      className="absolute flex flex-col gap-1 animate-float"
      style={{ top, left, animationDelay: delay, animationDuration: "6s" }}
    >
      <div
        className={`bg-white shadow-lg rounded-2xl px-3.5 py-2.5 text-[11px] font-medium text-gray-700 max-w-[180px] leading-snug border border-green-100
          ${align === "right" ? "rounded-br-sm" : "rounded-bl-sm"}`}
      >
        {text}
      </div>
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="text-[9px] text-gray-400">just now</span>
      </div>
    </div>
  );
}

// ── Stat counter ─────────────────────────────────────────────────────────────
function StatCard({ number, label, icon }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-5 bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <span className="text-2xl">{icon}</span>
      <span className="font-['Playfair_Display'] text-3xl font-bold text-gray-900">{number}</span>
      <span className="text-[12px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent, delay }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-green-100 p-6 hover:border-green-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      style={{ animationDelay: delay }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${accent} group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <h3 className="font-['Playfair_Display'] text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-[13.5px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Chat mockup message ───────────────────────────────────────────────────────
function ChatMsg({ text, time, type = "received", label }) {
  const isReceived = type === "received";
  return (
    <div className={`flex flex-col gap-0.5 ${isReceived ? "items-start" : "items-end"} mb-3`}>
      {label && (
        <span className="text-[9px] text-gray-400 px-1 uppercase tracking-widest mb-0.5">{label}</span>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed font-medium shadow-sm
          ${isReceived
            ? "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
            : "bg-green-500 text-white rounded-tr-sm"
          }`}
      >
        {text}
      </div>
      <span className="text-[9px] text-gray-400 px-1">{time}</span>
    </div>
  );
}

// ── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, price, features, highlight = false }) {
  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1
        ${highlight
          ? "bg-green-600 text-white shadow-2xl shadow-green-200 border-2 border-green-500"
          : "bg-white border border-green-100 shadow-sm hover:shadow-lg"
        }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <div>
        <p className={`text-[12px] font-semibold uppercase tracking-widest mb-2 ${highlight ? "text-green-200" : "text-green-600"}`}>{plan}</p>
        <div className="flex items-baseline gap-1">
          <span className={`font-['Playfair_Display'] text-4xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>{price}</span>
          <span className={`text-[13px] ${highlight ? "text-green-200" : "text-gray-400"}`}>/month</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-[13px] ${highlight ? "text-green-50" : "text-gray-600"}`}>
            <span className={`mt-0.5 text-[10px] flex-shrink-0 font-bold ${highlight ? "text-green-300" : "text-green-500"}`}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`mt-auto py-3 rounded-xl font-semibold text-[13px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
          ${highlight
            ? "bg-white text-green-700 hover:bg-green-50"
            : "bg-green-500 text-white hover:bg-green-600"
          }`}
      >
        Get Started
      </button>
    </div>
  );
}

// ── Step ─────────────────────────────────────────────────────────────────────
function HowStep({ num, title, desc, last }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-green-500 text-white font-bold text-[14px] flex items-center justify-center flex-shrink-0 shadow-md shadow-green-200">
          {num}
        </div>
        {!last && <div className="flex-1 w-px bg-green-200 mt-2 mb-0" />}
      </div>
      <div className="pb-8">
        <h4 className="font-['Playfair_Display'] text-[16px] font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-[13.5px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Testimonial ───────────────────────────────────────────────────────────────
function Testimonial({ quote, name, hall, stars = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-green-100 p-6 flex flex-col gap-4 hover:shadow-lg hover:border-green-200 transition-all duration-200">
      <div className="flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i} className="text-amber-400 text-sm">★</span>
        ))}
      </div>
      <p className="text-[13.5px] text-gray-600 leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-bold text-[12px]">
          {name[0]}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">{name}</p>
          <p className="text-[11px] text-gray-400">{hall}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const automationTabs = [
    {
      label: "Event Reminders",
      icon: "📅",
      messages: [
        { type: "received", text: "Hi! Your wedding event is scheduled in 7 days 🎉. Venue: Grand Hall A. Time: 6:00 PM.", time: "9:00 AM", label: "7 days before" },
        { type: "received", text: "Just 3 days to go! Here's your final checklist and seating plan 📋", time: "9:00 AM", label: "3 days before" },
        { type: "received", text: "Tomorrow is your big day! 🌹 Your team arrives at 3:00 PM for setup.", time: "9:00 AM", label: "1 day before" },
      ],
    },
    {
      label: "Booking Confirmations",
      icon: "✅",
      messages: [
        { type: "sent", text: "Hi, I want to book Hall A for Dec 20th for a wedding of 400 guests.", time: "11:22 AM" },
        { type: "received", text: "Great choice! Hall A is available on Dec 20th. Capacity: 500 guests. Package starts at ₨150,000. Shall I confirm? ✨", time: "11:22 AM" },
        { type: "sent", text: "Yes, please confirm!", time: "11:23 AM" },
        { type: "received", text: "✅ Booking Confirmed! Ref #BNQ-2024-1823. A receipt has been sent to your email.", time: "11:23 AM" },
      ],
    },
    {
      label: "Expense Receipts",
      icon: "🧾",
      messages: [
        { type: "received", text: "🧾 RECEIPT — Grand Banquet Hall\n\nDecoration: ₨45,000\nCatering (400 pax): ₨200,000\nSound & Lights: ₨30,000\n──────────────\nTotal: ₨275,000\n\nRef: #BNQ-1823 | Paid ✅", time: "2:00 PM" },
      ],
    },
    {
      label: "Cold Calling",
      icon: "📞",
      messages: [
        { type: "received", text: "Hi! 👋 We have a special offer this season — Book Hall B and get 15% off on catering. Interested?", time: "10:00 AM" },
        { type: "sent", text: "Yes, tell me more!", time: "10:02 AM" },
        { type: "received", text: "Amazing! 🎊 Our Hall B fits 300 guests with premium décor. I'll send you the full package brochure right now.", time: "10:02 AM" },
        { type: "received", text: "📄 [Hall B Package Brochure.pdf]", time: "10:02 AM" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 font-['DM_Sans',sans-serif]">

      {/* ── CSS Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp .7s ease forwards; }
        .wavy-line { background: repeating-linear-gradient(90deg, #22c55e 0 8px, transparent 8px 14px); height: 3px; border-radius: 2px; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-[15px]">
              W
            </div>
            <span className="font-['Playfair_Display'] text-[18px] font-bold text-gray-900">WaQet</span>
            <span className="hidden sm:block text-[11px] text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full">BANQUET AUTOMATION</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-gray-600">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="hover:text-green-600 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:block text-[13px] font-medium text-gray-600 hover:text-green-600 transition-colors">
              Login
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
              Start Free Trial
            </button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-green-100 px-6 py-4 flex flex-col gap-3 text-[14px] font-medium text-gray-700">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100 rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-200 rounded-full opacity-30 blur-3xl -translate-x-1/3 translate-y-1/3" />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "linear-gradient(#16a34a 1px, transparent 1px), linear-gradient(90deg, #16a34a 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Floating WhatsApp bubbles */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <WaBubble delay="0s"   top="14%" left="4%"   text="🎉 Your event in 7 days! Venue ready." />
          <WaBubble delay="1.5s" top="22%" left="72%"  text="✅ Booking confirmed! Ref #BNQ-1823" align="right" />
          <WaBubble delay="3s"   top="58%" left="6%"   text="🧾 Receipt sent: ₨2,75,000 — Paid" />
          <WaBubble delay="0.8s" top="68%" left="70%"  text="📞 Special offer: 15% off Hall B 🌟" align="right" />
          <WaBubble delay="2.2s" top="80%" left="38%"  text="🌹 1 day to go! Setup team at 3 PM." />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-20">

          {/* Left: copy */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 text-[12px] font-semibold px-3.5 py-1.5 rounded-full mb-6">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500"></span>
              </span>
              WhatsApp Automation for Banquets
            </div>

            <h1 className="font-['Playfair_Display'] text-[46px] lg:text-[58px] font-bold text-gray-900 leading-[1.1] mb-6">
              Run Your Banquet
              <span className="block text-green-600 italic">on Autopilot</span>
            </h1>

            <div className="wavy-line w-16 mb-6" />

            <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-lg">
              Automate WhatsApp messages for event reminders, booking confirmations, cold outreach, expense receipts, and more — built exclusively for the banquet industry.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl text-[15px] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-200">
                Start Free Trial — 14 Days
              </button>
              <button className="bg-white hover:bg-green-50 text-gray-700 font-semibold px-7 py-3.5 rounded-xl text-[15px] border border-green-200 transition-all hover:scale-105 active:scale-95">
                ▶ Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-5 text-[13px] text-gray-400">
              {["No credit card required", "Setup in 10 minutes", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-green-500 font-bold">✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: phone mockup */}
          <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-green-300 rounded-[44px] opacity-20 blur-2xl scale-110" />

              {/* Phone */}
              <div className="relative w-[280px] bg-[#111] rounded-[40px] shadow-2xl overflow-hidden border-4 border-[#222]">
                {/* Status bar */}
                <div className="bg-[#111] px-6 pt-3 pb-1 flex justify-between items-center">
                  <span className="text-white text-[11px] font-medium">9:41</span>
                  <div className="w-24 h-5 bg-[#111] rounded-full border-2 border-[#333]" />
                  <div className="flex gap-1 items-center">
                    <div className="text-white text-[10px]">●●●</div>
                  </div>
                </div>

                {/* WhatsApp header */}
                <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[14px]">
                    BH
                  </div>
                  <div>
                    <p className="text-white font-semibold text-[13px]">Banquet Hall</p>
                    <p className="text-green-200 text-[11px]">Business Account · Online</p>
                  </div>
                </div>

                {/* Chat */}
                <div className="bg-[#e5ddd5] bg-opacity-90 px-3 py-4 min-h-[320px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.05'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%2316a34a' fill='none'/%3E%3C/g%3E%3C/svg%3E\")" }}>

                  <div className="text-center mb-3">
                    <span className="text-[10px] bg-white/70 text-gray-500 rounded-full px-3 py-1">Today</span>
                  </div>

                  {/* Received */}
                  <div className="flex mb-2">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%]">
                      <p className="text-[11px] text-gray-800 leading-relaxed">
                        🎉 <b>Event Reminder!</b> Your wedding is in <b>7 days</b>. Hall A is ready. Team briefing on Dec 16 at 2PM.
                      </p>
                      <p className="text-[9px] text-gray-400 text-right mt-1">9:00 AM</p>
                    </div>
                  </div>

                  {/* Received */}
                  <div className="flex mb-2">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%]">
                      <p className="text-[11px] text-gray-800 leading-relaxed">
                        🧾 <b>Receipt Ready!</b><br />Decoration: ₨45,000<br />Catering: ₨2,00,000<br /><b>Total: ₨2,75,000 ✅</b>
                      </p>
                      <p className="text-[9px] text-gray-400 text-right mt-1">2:00 PM</p>
                    </div>
                  </div>

                  {/* Sent */}
                  <div className="flex justify-end mb-2">
                    <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm max-w-[85%]">
                      <p className="text-[11px] text-gray-800">Thank you! 🙏</p>
                      <p className="text-[9px] text-gray-400 text-right mt-1">2:01 PM ✓✓</p>
                    </div>
                  </div>

                  {/* Received */}
                  <div className="flex mb-2">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%]">
                      <p className="text-[11px] text-gray-800">📞 <b>Tomorrow's your big day!</b> 🌹 See you at 3 PM for setup. Excited for you!</p>
                      <p className="text-[9px] text-gray-400 text-right mt-1">8:00 AM</p>
                    </div>
                  </div>
                </div>

                {/* Input bar */}
                <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400">Type a message…</div>
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-[12px]">➤</div>
                </div>
              </div>

              {/* Decorative floating badge */}
              <div className="absolute -right-4 top-12 bg-white rounded-2xl shadow-xl border border-green-100 px-4 py-2.5 animate-float" style={{ animationDelay: "1s" }}>
                <p className="text-[10px] text-gray-400">Messages sent today</p>
                <p className="font-['Playfair_Display'] text-[22px] font-bold text-green-600">1,284</p>
              </div>
              <div className="absolute -left-6 bottom-24 bg-white rounded-2xl shadow-xl border border-green-100 px-4 py-2.5 animate-float" style={{ animationDelay: "2s" }}>
                <p className="text-[10px] text-gray-400">Open rate</p>
                <p className="font-['Playfair_Display'] text-[22px] font-bold text-green-600">98%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-green-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard number="2,400+" label="Banquet Halls Onboarded"   icon="🏛️" />
            <StatCard number="12M+"   label="WhatsApp Messages Sent"     icon="💬" />
            <StatCard number="98%"    label="Message Open Rate"          icon="📊" />
            <StatCard number="4.9★"   label="Average Client Rating"      icon="⭐" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 className="font-['Playfair_Display'] text-[38px] font-bold text-gray-900 mb-4">
            Built for Banquet Halls
          </h2>
          <p className="text-gray-500 text-[15px] max-w-xl mx-auto leading-relaxed">
            Every automation your venue needs — from first inquiry to post-event follow-up, all on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon="📅" title="Event Countdown Reminders"
            desc="Auto-send reminders at 7 days, 3 days, 1 day, and morning-of. Clients always feel informed and cared for."
            accent="bg-green-100"
          />
          <FeatureCard
            icon="✅" title="Instant Booking Confirmations"
            desc="Send a professional confirmation with event details, ref number, and payment link the moment a booking is made."
            accent="bg-emerald-100"
          />
          <FeatureCard
            icon="📞" title="Smart Cold Outreach"
            desc="Target potential clients by season or event type. Send personalized WhatsApp messages that feel human, not robotic."
            accent="bg-teal-100"
          />
          <FeatureCard
            icon="🧾" title="Automated Expense Receipts"
            desc="Generate and send itemized receipts — catering, décor, AV, hall rental — directly to client WhatsApp instantly."
            accent="bg-green-100"
          />
          <FeatureCard
            icon="🌹" title="Post-Event Follow-Ups"
            desc="Send thank-you messages, photo gallery links, and review requests after every event automatically."
            accent="bg-emerald-100"
          />
          <FeatureCard
            icon="📊" title="Booking Analytics Dashboard"
            desc="Track message delivery, open rates, booking conversions, and hall occupancy from one clean dashboard."
            accent="bg-teal-100"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          INTERACTIVE AUTOMATION PREVIEW
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-green-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-3">Live Preview</p>
            <h2 className="font-['Playfair_Display'] text-[38px] font-bold text-gray-900 mb-4">
              See the Automations in Action
            </h2>
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* Tab selector */}
            <div>
              <div className="flex flex-wrap gap-2 mb-8">
                {automationTabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all
                      ${activeTab === i
                        ? "bg-green-500 text-white shadow-md shadow-green-200"
                        : "bg-green-50 text-gray-600 hover:bg-green-100"
                      }`}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-['Playfair_Display'] text-[22px] font-bold text-gray-900 mb-3">
                  {automationTabs[activeTab].icon} {automationTabs[activeTab].label}
                </h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  {activeTab === 0 && "Keep your clients excited and prepared. Automated reminders go out at 7 days, 3 days, and 1 day before their event — with venue info, time, and team details."}
                  {activeTab === 1 && "The moment a booking is confirmed in your system, the client instantly receives a WhatsApp message with all details, reference number, and payment confirmation."}
                  {activeTab === 2 && "Stop chasing clients for payments. Auto-generate and send beautifully formatted receipts with itemized billing directly to their WhatsApp."}
                  {activeTab === 3 && "Reach potential clients with targeted WhatsApp messages during peak wedding seasons. Personalized, professional, and perfectly timed cold outreach."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    activeTab === 0 ? ["7-day alert", "3-day alert", "Day-before alert"] :
                    activeTab === 1 ? ["Instant confirm", "PDF receipt", "Payment link"] :
                    activeTab === 2 ? ["Itemized bill", "Auto-calculate", "Tap to pay"] :
                                     ["Seasonal targeting", "AI personalization", "Opt-out safe"]
                  ][0].map((tag) => (
                    <span key={tag} className="text-[11px] bg-white border border-green-200 text-green-700 font-semibold px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat window */}
            <div className="bg-[#e5ddd5] rounded-2xl overflow-hidden border border-green-100 shadow-lg">
              {/* Header */}
              <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">BH</div>
                <div>
                  <p className="text-white font-semibold text-[13px]">Banquet Hall ✓</p>
                  <p className="text-green-200 text-[10px]">Automated · WhatsApp Business</p>
                </div>
              </div>
              <div className="p-4 min-h-[280px]">
                {automationTabs[activeTab].messages.map((m, i) => (
                  <ChatMsg key={i} {...m} />
                ))}
              </div>
              <div className="bg-[#f0f0f0] px-4 py-2 flex items-center gap-2">
                <div className="flex-1 bg-white rounded-full px-3 py-2 text-[11px] text-gray-400">Type a message…</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">➤</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-3">Simple Setup</p>
            <h2 className="font-['Playfair_Display'] text-[38px] font-bold text-gray-900 mb-4">
              Live in Under<br />10 Minutes
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
              No technical knowledge needed. Connect your WhatsApp Business number and let WaQet handle the rest.
            </p>

            <HowStep num="1" title="Connect WhatsApp Business"
              desc="Link your existing WhatsApp Business number through our secure API integration. No new number needed." />
            <HowStep num="2" title="Configure Your Hall & Events"
              desc="Add your hall details, packages, and event types. Set up your messaging templates once." />
            <HowStep num="3" title="Define Automation Rules"
              desc="Choose when and what to send — reminders, confirmations, receipts, cold outreach campaigns." />
            <HowStep num="4" title="Go Live & Watch It Work" last
              desc="Every new booking triggers the right messages automatically. You focus on the event; we handle the communication." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🔌", label: "WhatsApp API", desc: "Official Meta API — no bans" },
              { icon: "⚡", label: "Instant Delivery", desc: "Messages in under 2 seconds" },
              { icon: "🔒", label: "GDPR Safe", desc: "Client data fully protected" },
              { icon: "📱", label: "Any Device", desc: "Web, mobile, tablet ready" },
              { icon: "🌐", label: "Multi-Language", desc: "Urdu, English, Arabic & more" },
              { icon: "📈", label: "Live Analytics", desc: "Open, click & reply rates" },
            ].map((item) => (
              <div key={item.label}
                className="bg-white rounded-2xl border border-green-100 p-4 hover:border-green-300 hover:shadow-md transition-all duration-200">
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="font-semibold text-[13px] text-gray-800 mb-0.5">{item.label}</p>
                <p className="text-[12px] text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="bg-green-50 py-24 border-y border-green-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-3">Transparent Pricing</p>
            <h2 className="font-['Playfair_Display'] text-[38px] font-bold text-gray-900 mb-4">
              Simple Plans, No Surprises
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <PricingCard
              plan="Starter"
              price="₨4,999"
              features={[
                "1 WhatsApp number",
                "Up to 500 messages/month",
                "Event reminders (7-day & 1-day)",
                "Booking confirmations",
                "Basic analytics dashboard",
                "Email support",
              ]}
            />
            <PricingCard
              plan="Professional"
              price="₨9,999"
              highlight
              features={[
                "2 WhatsApp numbers",
                "Up to 5,000 messages/month",
                "Full reminder sequences",
                "Expense receipt automation",
                "Cold outreach campaigns",
                "Post-event follow-ups",
                "Advanced analytics",
                "Priority support",
              ]}
            />
            <PricingCard
              plan="Enterprise"
              price="₨19,999"
              features={[
                "Unlimited WhatsApp numbers",
                "Unlimited messages",
                "All Professional features",
                "Multi-hall management",
                "Custom message templates",
                "API access & integrations",
                "Dedicated account manager",
                "Custom SLA support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-green-600 text-[12px] font-bold uppercase tracking-widest mb-3">Client Stories</p>
          <h2 className="font-['Playfair_Display'] text-[38px] font-bold text-gray-900 mb-4">
            Loved by Hall Managers
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Testimonial
            quote="We used to call every client manually before their event. Now WaQet handles it all. Our no-show rate dropped by 80%."
            name="Tariq Mahmood" hall="Al-Noor Banquet Hall, Karachi"
          />
          <Testimonial
            quote="The cold outreach feature is incredible. We booked 12 new events in the first month just from automated messages."
            name="Fatima Raza" hall="Rose Garden Banquet, Lahore"
          />
          <Testimonial
            quote="Sending receipts on WhatsApp is genius. Clients love getting everything on their phone. Zero complaints about billing now."
            name="Asim Khan" hall="Crystal Palace Events, Islamabad"
          />
          <Testimonial
            quote="Setup took 8 minutes. I couldn't believe how fast it was. Our clients keep asking how we got so organized!"
            name="Huma Siddiqui" hall="Pearl Continental Banquets, Rawalpindi"
          />
          <Testimonial
            quote="The 7-day reminder sequence is perfect. Clients actually read WhatsApp messages, unlike emails. Open rate is near 100%."
            name="Bilal Chaudhry" hall="Grand Marquee, Faisalabad"
          />
          <Testimonial
            quote="Best investment we made this year. It pays for itself with just one extra booking a month from the cold outreach alone."
            name="Amna Qadir" hall="Emerald Lawn & Hall, Multan"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-green-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 50%)" }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-['Playfair_Display'] text-[38px] lg:text-[46px] font-bold text-white mb-4 leading-tight">
            Ready to Automate Your Banquet Hall?
          </h2>
          <p className="text-green-100 text-[16px] mb-8 leading-relaxed">
            Join 2,400+ banquet halls already running on WhatsApp autopilot. Start your free 14-day trial today — no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="bg-white text-green-700 font-bold px-8 py-4 rounded-xl text-[15px] hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-lg">
              Start Free Trial →
            </button>
            <button className="border-2 border-white/60 text-white font-semibold px-8 py-4 rounded-xl text-[15px] hover:bg-white/10 transition-all">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">W</div>
              <span className="font-['Playfair_Display'] text-[18px] font-bold text-white">WaQet</span>
            </div>
            <p className="text-[13px] leading-relaxed">
              WhatsApp automation built exclusively for the banquet and events industry.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Demo", "Changelog"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Support", links: ["Help Center", "API Docs", "Status", "Privacy Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-white font-semibold text-[13px] mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] hover:text-green-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-wrap justify-between items-center gap-4 text-[12px]">
          <p>© 2026 WaQet. All rights reserved.</p>
          <p>Made with 💚 for the banquet industry</p>
        </div>
      </footer>
    </div>
  );
}