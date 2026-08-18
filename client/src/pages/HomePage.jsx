import React, { useState } from "react";
import {
  Bot, MessageCircle, Database, Globe, Smartphone, Wallet,
  ArrowRight, ArrowUpRight, Menu, X
} from "lucide-react";

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
.marquee-l { animation: marquee-l 32s linear infinite; }
.marquee-r { animation: marquee-r 32s linear infinite; }
.marquee-wrap:hover .marquee-l, .marquee-wrap:hover .marquee-r { animation-play-state: paused; }
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.pulse { animation: pulse-dot 1.8s ease-in-out infinite; }
@keyframes drift { 0% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } 50% { transform: scale(1.3) translate(2%, 2%) rotate(1deg); } 100% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } }
.drift-bg { animation: drift 14s ease-in-out infinite; }
@keyframes sweep { 0% { transform: translateX(-40%) skewX(-12deg); opacity: 0; } 10% { opacity: 0.5; } 50% { opacity: 0.5; } 90% { opacity: 0; } 100% { transform: translateX(140%) skewX(-12deg); opacity: 0; } }
.sweep { animation: sweep 6s ease-in-out infinite; }
@keyframes scroll-dot { 0%,100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(6px); opacity: 0.4; } }
.scroll-dot { animation: scroll-dot 1.8s ease-in-out infinite; }
`;

const SERVICES = [
  { icon: Bot, n: "01", title: "AI Agents", desc: "Agents that qualify leads and answer questions around the clock." },
  { icon: MessageCircle, n: "02", title: "WhatsApp Business API", desc: "Booking, reminders and support automated on Meta's Cloud API." },
  { icon: Database, n: "03", title: "CRM Systems", desc: "Pipelines and dashboards built around how your team actually sells." },
  { icon: Globe, n: "04", title: "Websites", desc: "Fast, conversion-focused sites that turn traffic into booked calls." },
  { icon: Smartphone, n: "05", title: "Mobile Apps", desc: "iOS and Android apps for internal tools or customer products." },
  { icon: Wallet, n: "06", title: "Crypto Payment Gateways", desc: "Gateways that settle straight into your existing checkout." },
];

const REVIEWS = [
  { name: "Darbar Banquet", location: "Pakistan", tag: "Venue Automation", text: "They automated our full booking flow — WhatsApp bot, receipts, onboarding. It just works." },
  { name: "Aaron", location: "United States", tag: "Product Build", text: "Professional, solution-focused, and calm under pressure. Communication was excellent throughout." },
  { name: "teamstack", location: "Thailand", tag: "Web3 / Payments", text: "Matched our pace on a tight deadline. Already started a second project with them." },
  { name: "Richard", location: "United States", tag: "Web Platform", text: "Clear updates, solid delivery, and a product that landed better than expected." },
];

function ReviewCard({ r }) {
  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="font-body text-[15px] leading-relaxed text-zinc-800">"{r.text}"</p>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <div>
          <p className="font-display text-sm font-semibold text-zinc-900">{r.name}</p>
          <p className="font-mono text-xs text-zinc-500">{r.location}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-emerald-700">{r.tag}</span>
      </div>
    </div>
  );
}

function Marquee() {
  const row = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];
  return (
    <section className="border-y border-zinc-200 bg-zinc-50 py-16">
      <div className="mx-auto mb-10 max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Client feedback</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-zinc-900 md:text-4xl">What clients say after we ship.</h2>
      </div>
      <div className="marquee-wrap overflow-hidden">
        <div className="flex w-max gap-4 marquee-l">
          {row.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
    </section>
  );
}

function Logo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white-900">
     <img src="./main-removebg-preview.png" alt="" />
    </div>
  );
}

function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight text-zinc-900">Vanexta</span>
        </a>
        <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 md:flex">
          <a href="/" className="rounded-full px-4 py-1.5 font-body text-sm bg-white text-zinc-900 shadow-sm transition-colors">Home</a>
          <a href="#services" className="rounded-full px-4 py-1.5 font-body text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Services</a>
          <a href="#reviews" className="rounded-full px-4 py-1.5 font-body text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Reviews</a>
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
          <a href="/" onClick={() => setOpen(false)} className="block w-full py-2 text-left font-body text-zinc-700">Home</a>
          <a href="#services" onClick={() => setOpen(false)} className="block w-full py-2 text-left font-body text-zinc-700">Services</a>
          <a href="#reviews" onClick={() => setOpen(false)} className="block w-full py-2 text-left font-body text-zinc-700">Reviews</a>
          <a href="/book" onClick={() => setOpen(false)} className="mt-2 block w-full rounded-full bg-zinc-900 px-4 py-2 text-center font-body text-sm font-medium text-white">Book a call</a>
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
        <div className="flex items-center justify-between">
        </div>

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

function Showcase() {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">WhatsApp-native</p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-zinc-900 md:text-3xl">Your customers already live on WhatsApp.</h3>
            <p className="mt-4 font-body text-zinc-600">Booking confirmations, payment reminders, and support — automated on the official Meta Cloud API, no third-party middleman costs.</p>
          </div>
          <img src={WA_IMG} alt="AI chat automation illustration" className="rounded-2xl border border-zinc-200 md:-rotate-1" />
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
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
        <p>Vanexta — Karachi, Pakistan</p>
        <p>© {new Date().getFullYear()} Vanexta. All rights reserved.</p>
      </div>
    </footer>
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
      <div id="reviews">
        <Marquee />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}