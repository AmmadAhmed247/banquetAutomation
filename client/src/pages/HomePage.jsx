import React, { useState } from "react";
import {
  Bot, MessageCircle, Database, Globe, Smartphone, Wallet,
  ArrowRight, ArrowUpRight, Menu, X, Terminal, Activity, UserCheck, Play,
  Mic, MessageSquare
} from "lucide-react";
import { ReviewCard, REVIEWS } from "../components/clientReviews.jsx";

const WA_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3HrL189N3SZfcJ1cBXy3Vk0GNFp/hf_20260818_112201_250fe9f2-6466-43e2-a17c-66cf9f37c7c7.png";
const CRYPTO_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3HrL189N3SZfcJ1cBXy3Vk0GNFp/hf_20260818_112205_bbdaa6f7-ca47-496d-940d-cf0de5c27703.png";
const STREAK_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3HrL189N3SZfcJ1cBXy3Vk0GNFp/hf_20260818_113527_290afeae-e608-4795-ad9d-c645c6f1e321.png";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
@keyframes marquee-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marquee-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.marquee-l { animation: marquee-l 38s linear infinite; }
.marquee-r { animation: marquee-r 38s linear infinite; }
.marquee-wrap:hover .marquee-l, .marquee-wrap:hover .marquee-r { animation-play-state: paused; }
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.pulse { animation: pulse-dot 1.8s ease-in-out infinite; }
@keyframes drift { 0% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } 50% { transform: scale(1.3) translate(2%, 2%) rotate(1deg); } 100% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } }
.drift-bg { animation: drift 14s ease-in-out infinite; }
@keyframes sweep { 0% { transform: translateX(-40%) skewX(-12deg); opacity: 0; } 10% { opacity: 0.5; } 50% { opacity: 0.5; } 90% { opacity: 0; } 100% { transform: translateX(140%) skewX(-12deg); opacity: 0; } }
.sweep { animation: sweep 6s ease-in-out infinite; }
@keyframes scroll-dot { 0%,100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(6px); opacity: 0.4; } }
.scroll-dot { animation: scroll-dot 1.8s ease-in-out infinite; }

/* Interactive Demo Animations */
@keyframes eq-wave { 0%, 100% { height: 4px; opacity: 0.4; } 50% { height: 24px; opacity: 1; } }
.wave-1 { animation: eq-wave 0.6s ease-in-out infinite; }
.wave-2 { animation: eq-wave 0.4s ease-in-out 0.1s infinite; }
.wave-3 { animation: eq-wave 0.8s ease-in-out 0.2s infinite; }
.wave-4 { animation: eq-wave 0.5s ease-in-out 0.15s infinite; }

@keyframes fade-slide-up {
  0% { transform: translateY(10px) scale(0.98); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.animate-entry { animation: fade-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`;

const SERVICES = [
  { icon: Bot, n: "01", title: "AI Agents", desc: "Agents that qualify leads and answer questions around the clock." },
  { icon: MessageCircle, n: "02", title: "WhatsApp Business API", desc: "Booking, reminders and support automated on Meta's Cloud API." },
  { icon: Database, n: "03", title: "CRM Systems", desc: "Pipelines and dashboards built around how your team actually sells." },
  { icon: Globe, n: "04", title: "Websites", desc: "Fast, conversion-focused sites that turn traffic into booked calls." },
  { icon: Smartphone, n: "05", title: "Mobile Apps", desc: "iOS and Android apps for internal tools or customer products." },
  { icon: Wallet, n: "06", title: "Crypto Payment Gateways", desc: "Gateways that settle straight into your existing checkout." },
];

function Marquee() {
  const rowA = [...REVIEWS, ...REVIEWS];

  return (
    <section id="reviews" className="border-y border-zinc-200 bg-zinc-50 py-20">
      <div className="mx-auto mb-12 max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Client feedback</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-zinc-900 md:text-4xl">
          What clients say after we ship.
        </h2>
      </div>

      <div
        className="marquee-wrap flex flex-col gap-5 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max gap-5 marquee-l">
          {rowA.map((r, i) => (
            <ReviewCard key={`a-${i}`} r={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Logo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <img src="./symbol.svg" alt="Vanexta" className="h-full w-full object-contain" />
    </div>
  );
}

function NavBar() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Home", href: "#" },
    { id: "services", label: "Services", href: "#services" },
    { id: "reviews", label: "Reviews", href: "#reviews" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#" onClick={() => setActiveTab("home")} className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight text-zinc-900">Vanexta</span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className={`rounded-full px-4 py-1.5 font-body text-sm transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-white text-zinc-900 shadow-sm font-medium"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="/book" className="hidden items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 font-body text-sm font-medium text-white hover:bg-zinc-800 transition-colors md:flex">
          Book a call <ArrowRight size={14} />
        </a>

        <button className="text-zinc-700 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-200 px-6 py-4 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => {
                setActiveTab(item.id);
                setOpen(false);
              }}
              className={`block w-full py-2 text-left font-body text-sm ${
                activeTab === item.id ? "font-semibold text-zinc-900" : "text-zinc-700"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a href="/book" onClick={() => setOpen(false)} className="mt-2 block w-full rounded-full bg-zinc-900 px-4 py-2 text-center font-body text-sm font-medium text-white">
            Book a call
          </a>
        </div>
      )}
    </header>
  );
}

const STATS = [
  { value: "06", label: "Core services" },
  { value: "<24h", label: "Response time" },
  { value: "100%", label: "WhatsApp-native" },
];

function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden border-b border-zinc-200 bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <img src={STREAK_IMG} alt="" className="drift-bg h-full w-full object-cover" />
        <div className="sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white" />
      </div>

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-6 pb-10 pt-8">
        <div className="flex items-center justify-between" />

        <div className="py-16 md:py-24">
          <p className="font-display text-xl font-light text-zinc-400 md:text-2xl">We build the</p>
          <h1 className="mt-2 font-display text-6xl font-medium leading-[0.95] tracking-tight text-zinc-900 md:text-8xl">
            Systems That<br />Turn Traffic Into<br /><span className="text-emerald-600">Booked</span> Customers
          </h1>
          <p className="mt-8 max-w-md font-body text-lg text-zinc-600">
            AI agents, WhatsApp automation, CRMs, websites, mobile apps and crypto payment gateways.
          </p>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <a href="/book" className="flex w-fit items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 font-body font-medium text-white hover:bg-zinc-800 transition-colors">
            Book a free call <ArrowRight size={16} />
          </a>

          <div className="flex gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-right">
                <p className="font-display text-3xl font-semibold text-zinc-900 md:text-4xl">{s.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-zinc-300 p-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 scroll-dot" />
        </span>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">What we build</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-zinc-900 md:text-4xl">One team, every piece of your stack.</h2>
        </div>
      </div>
      <div className="mt-10 divide-y divide-zinc-200 border-t border-zinc-200">
        {SERVICES.map(({ icon: Icon, n, title, desc }) => (
          <div key={n} className="group grid grid-cols-[auto_1fr] items-center gap-6 py-6 md:grid-cols-[3rem_auto_1fr_2.5rem] md:gap-8">
            <span className="font-mono text-sm text-zinc-400">{n}</span>
            <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors md:flex">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1 font-body text-sm text-zinc-600">{desc}</p>
            </div>
            <ArrowUpRight size={18} className="hidden justify-self-end text-zinc-300 group-hover:text-emerald-600 transition-colors md:block" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- Human-Readable Interactive System Demo --- */
function SystemTerminalDemo() {
  const [selectedTab, setSelectedTab] = useState("whatsapp"); 
  const [isRunning, setIsRunning] = useState(false);
  const [stepState, setStepState] = useState(0);

  const [metrics, setMetrics] = useState({ leadsBooked: 247, latency: "< 1s", accuracy: "99.8%" });
  const [voiceStream, setVoiceStream] = useState([]);
  const [waStream, setWaStream] = useState([{ role: "agent", text: "Welcome to Vanexta! How can we help scale your systems today?", actions: ["Book Discovery Call", "View Services"] }]);
  
  const [crmLeads, setCrmLeads] = useState([
    { id: 1, name: "Alexander Vance", contact: "+1 (415) 890-2100", channel: "Voice Call", req: "Strategy Consultation", slot: "Tomorrow @ 3:30 PM", status: "Confirmed" },
  ]);

  const runSimulation = () => {
    setIsRunning(true);
    setStepState(1);
    
    if (selectedTab === "voice") {
      setVoiceStream([]);
      setTimeout(() => { setStepState(2); setVoiceStream([{ role: "user", text: "Hi, I want to book a call to discuss automating my sales team." }]); }, 1500);
      setTimeout(() => { setVoiceStream(p => [...p, { role: "agent", text: "I can absolutely help with that. I have an opening this Thursday at 2:00 PM EST. Should I lock that in for you?" }]); }, 3500);
      setTimeout(() => { setVoiceStream(p => [...p, { role: "user", text: "Yes, book it under Marcus Brody." }]); }, 5500);
      setTimeout(() => { 
        setStepState(3); 
        setVoiceStream(p => [...p, { role: "agent", text: "You're all set! Marcus Brody is booked for Thursday. I've sent the details directly to the CRM." }]); 
        pushToCrm("Marcus Brody", "+1 (305) 789-0112", "Voice Call", "Sales Automation", "Thursday @ 2:00 PM");
      }, 7500);
    } else {
      setWaStream([{ role: "agent", text: "Welcome to Vanexta! How can we help scale your systems today?", actions: ["Book Discovery Call", "View Services"] }]);
      setTimeout(() => { setWaStream(p => [...p, { role: "user", text: "Book Discovery Call" }]); }, 1200);
      setTimeout(() => { setWaStream(p => [...p, { role: "agent", text: "Great! I have an opening on Tuesday, Nov 12th with our lead engineer. Should I hold this slot for Sarah Jenkins?" }]); }, 2800);
      setTimeout(() => { setWaStream(p => [...p, { role: "user", text: "Yes, that works perfectly." }]); }, 4500);
      setTimeout(() => { 
        setWaStream(p => [...p, { role: "agent", text: "Booking confirmed!", verified: true }]); 
        pushToCrm("Sarah Jenkins", "+44 7700 900077", "WhatsApp", "System Scoping", "Nov 12 @ 10:00 AM");
      }, 6200);
    }
  };

  const pushToCrm = (name, contact, channel, req, slot) => {
    setCrmLeads(p => [{ id: Date.now(), name, contact, channel, req, slot, status: "Confirmed", fresh: true }, ...p]);
    setMetrics(p => ({ ...p, leadsBooked: p.leadsBooked + 1 }));
    setIsRunning(false);
  };

  return (
    <div className="mb-16 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-200/50">
      <div className="rounded-2xl border border-zinc-100 bg-white p-6">
        
        {/* Top Header / Business Metrics Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-200 pb-6">
          <div className="flex gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Automated Bookings</p>
              <div className="mt-1 flex items-center gap-2 font-display text-2xl font-semibold text-zinc-900">
                {metrics.leadsBooked} <span className="text-emerald-600 flex items-center"><Activity size={16} /></span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-zinc-200" />
            <div className="hidden sm:block">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Avg Response Time</p>
              <div className="mt-1 font-mono text-xl text-zinc-800">{metrics.latency}</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-zinc-200" />
            <div className="hidden sm:block">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">AI Accuracy</p>
              <div className="mt-1 font-mono text-xl text-zinc-800">{metrics.accuracy}</div>
            </div>
          </div>

          <div className="flex w-full lg:w-auto items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1">
            <button onClick={() => setSelectedTab("whatsapp")} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all ${selectedTab === "whatsapp" ? "bg-white text-emerald-600 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900"}`}>
              <MessageSquare size={12} /> Test WhatsApp Bot
            </button>
            <button onClick={() => setSelectedTab("voice")} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all ${selectedTab === "voice" ? "bg-white text-emerald-600 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-900"}`}>
              <Mic size={12} /> Test Voice AI
            </button>
          </div>
        </div>

        {/* Split Console Panels */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          
          {/* Live Agent Interaction Feed (Left) */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase text-zinc-500">
                  <Terminal size={14} className="text-emerald-600" /> Live Agent Chat Feed
                </span>
                <span className={`flex h-2 w-2 rounded-full ${stepState > 0 ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
              </div>

              {selectedTab === "voice" ? (
                <div className="mt-5 space-y-4">
                  <div className="flex h-20 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm p-4">
                    {stepState > 0 && stepState < 3 ? (
                      <div className="flex items-center gap-2">
                        <span className="w-1 rounded-full bg-emerald-500 wave-1" />
                        <span className="w-1 rounded-full bg-emerald-500 wave-2" />
                        <span className="w-1 rounded-full bg-emerald-500 wave-3" />
                        <span className="w-1 rounded-full bg-emerald-500 wave-4" />
                        <span className="w-1 rounded-full bg-emerald-500 wave-2" />
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-zinc-400">Ready for Voice Call Simulation</span>
                    )}
                  </div>
                  <div className="min-h-[140px] space-y-2 overflow-y-auto font-mono text-[11px]">
                    {voiceStream.map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-lg border ${msg.role === "agent" ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-white border-zinc-200 text-zinc-700"}`}>
                        <span className="opacity-50 block mb-1 font-bold">{msg.role === "agent" ? "Voice AI Agent" : "Customer Phone"}</span>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="min-h-[200px] space-y-3 overflow-y-auto">
                    {waStream.map((m, idx) => (
                      <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-[11px] font-mono ${m.role === "user" ? "bg-emerald-600 text-white rounded-br-none shadow-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"}`}>
                          <span className="block opacity-60 mb-1 font-bold">{m.role === "user" ? "Customer" : "WhatsApp Bot"}</span>
                          {m.text}
                          {m.actions && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {m.actions.map((act, i) => (
                                <span key={i} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] text-emerald-700">{act}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3.5 font-mono text-[11px] uppercase font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              <Play size={12} fill="currentColor" /> {isRunning ? "Simulating Interaction..." : selectedTab === "voice" ? "Start Voice Call Demo" : "Start WhatsApp Demo"}
            </button>
          </div>

          {/* CRM Dashboard Live (Right) */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase text-zinc-500">
                <Database size={14} className="text-emerald-600" /> Live CRM Dashboard
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {crmLeads.map((lead) => (
                <div key={lead.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${lead.fresh ? "animate-entry border-emerald-300 bg-emerald-50/50" : "border-zinc-200 bg-white"}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h5 className="font-mono text-xs font-semibold text-zinc-900">{lead.name}</h5>
                      <div className="font-mono text-[10px] text-zinc-500 mt-1">{lead.contact}</div>
                    </div>
                  </div>
                  <div className="flex items-center sm:justify-end gap-5">
                    <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 text-right">
                      {lead.req}<br/><span className="text-emerald-600 font-semibold">{lead.slot}</span>
                    </span>
                    <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-[9px] uppercase text-zinc-600 font-semibold">
                      {lead.channel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ---------------------------------------------------------------------- */

function Showcase() {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl px-6 py-24">
        
        {/* Render the interactive system demo */}
        <SystemTerminalDemo />

        <div className="grid gap-16 md:grid-cols-2 md:items-center mt-12">
          <div>
            <h3 className="mt-3 font-display text-2xl font-semibold text-zinc-900 md:text-3xl">Your customers already live on WhatsApp.</h3>
            <p className="mt-4 font-body text-zinc-600">Booking confirmations, payment reminders, and support — automated on the official Meta Cloud API, no third-party middleman costs.</p>
          </div>
          <img src={WA_IMG} alt="AI chat automation illustration" className="rounded-2xl border border-zinc-200 md:-rotate-1" />
        </div>
        
        <div className="grid gap-16 md:grid-cols-2 md:items-center mt-16">
          <img src={CRYPTO_IMG} alt="Crypto payment gateway illustration" className="order-2 rounded-2xl border border-zinc-200 md:order-1 md:rotate-1" />
          <div className="order-1 md:order-2">
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Fintech-ready</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-zinc-900 md:text-3xl">Accept crypto without the integration headache.</h3>
            <p className="mt-4 font-body text-zinc-600">Custom gateways that settle into your existing checkout or CRM, built and audited for your specific flow.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">Free 15-minute call</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">Tell us what's leaking leads.<br />We'll fix it.</h2>
        <a href="/book" className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-body font-medium text-zinc-950 hover:bg-emerald-400 transition-colors">
          Book your call <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-sm text-zinc-500 md:flex-row">
        <div className="flex items-center flex-row gap-2">
          <img className="w-12" src="./symbol.svg" alt="" />
          <p> Vanexta ~ Karachi, Pakistan</p>
        </div>
        <p>© {new Date().getFullYear()} Vanexta. All rights reserved.</p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923402368339"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex items-center rounded-full bg-emerald-500 p-3.5 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 ease-out hover:bg-emerald-600 hover:pr-5"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 -z-10 rounded-full bg-emerald-400/50" style={{ animation: "ping 2.4s cubic-bezier(0,0,0.2,1) infinite" }} />
      <MessageCircle size={22} className="shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-body text-sm font-medium transition-all duration-300 ease-out group-hover:max-w-[150px] group-hover:pl-2">
        Chat on WhatsApp
      </span>
    </a>
  );
}

export default function VanextaLanding() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <style>{FONTS}</style>
      <NavBar />
      <Hero />
      <Services />
      <Showcase />
      <Marquee />
      <CTA />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}