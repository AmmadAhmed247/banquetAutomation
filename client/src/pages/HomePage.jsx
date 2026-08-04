import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import {
  MessageCircle,
  CalendarClock,
  Ticket,
  Bell,
  PhoneCall,
  Receipt,
  Code2,
  Smartphone,
  Bot,
  Target,
  ArrowRight,
  Menu,
  X,
  ArrowUpRight,
  Mail,
  Phone,
  ArrowUp,
  Play,
  Sparkles,
  Check,
  DollarSign,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Reveal-on-scroll wrapper
// ─────────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "700ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The Raabta Line — scroll-progress connection rail. The one recurring
// motif tying the page together (name = "connection").
// ─────────────────────────────────────────────────────────────────────────
function RaabtaLine({ progress }) {
  const nodes = [0, 0.25, 0.5, 0.75, 0.96];
  return (
    <div className="raabta-rail hidden lg:flex" aria-hidden="true">
      <div className="raabta-rail-track">
        <div className="raabta-rail-fill" style={{ height: `${Math.min(progress * 100, 100)}%` }} />
        {nodes.map((n, i) => (
          <div key={i} className={`raabta-node ${progress >= n ? "raabta-node-lit" : ""}`} style={{ top: `${n * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Video — simple, no card chrome, no tilt. Just a clean rounded player.
// Plays WITH sound on click. Swap the <source> for your own file.
// ─────────────────────────────────────────────────────────────────────────
function DemoVideo() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {});
    setPlaying(true);
  };

  return (
    <div
      className="video-frame"
      onClick={!playing ? handlePlay : undefined}
      role={!playing ? "button" : undefined}
      tabIndex={!playing ? 0 : -1}
      onKeyDown={(e) => {
        if (!playing && (e.key === "Enter" || e.key === " ")) handlePlay();
      }}
      aria-label={!playing ? "Play demo video with sound" : undefined}
    >
      <video
        ref={videoRef}
        className="video-el"
        playsInline
        controls={playing}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        {/* Replace with your own video file */}
        <source src="/promo.mp4" type="video/mp4" />
      </video>

      {!playing && (
        <div className="video-overlay">
          <button className="video-play-btn" aria-label="Play demo video">
            <Play size={22} fill="currentColor" style={{ marginLeft: 3 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Raabta Bot — floating chat widget, live demo of the agency's own
// automation. Scripted conversation, not a real backend.
// ─────────────────────────────────────────────────────────────────────────
function RaabtaBot() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0);

  const script = [
    { from: "bot", text: "Hey! I'm Raabta Bot 👋 Want to see how automation could work for your business?" },
    { from: "them", text: "Yeah, what can it actually do?" },
    { from: "bot", text: "Answer customer questions, confirm bookings, send reminders, and follow up — all on WhatsApp, 24/7." },
    { from: "bot", text: "Want to book a free call to see it set up for your business?" },
  ];

  useEffect(() => {
    if (!open) return;
    setShown(0);
    const timers = script.map((_, i) => setTimeout(() => setShown((s) => Math.max(s, i + 1)), i * 650));
    return () => timers.forEach(clearTimeout);
  }, [open]);

  return (
    <div className="bot-widget">
      {open && (
        <div className="bot-panel">
          <div className="bot-panel-header">
            <div className="bot-avatar">R</div>
            <div className="flex-1">
              <p className="bot-panel-title">Raabta Bot</p>
              <p className="bot-panel-sub">Typically replies instantly</p>
            </div>
            <button className="bot-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div className="bot-panel-body">
            {script.slice(0, shown).map((m, i) => (
              <div key={i} className={`chat-row ${m.from === "bot" ? "chat-row-bot" : "chat-row-them"}`}>
                <div className={`chat-bubble ${m.from === "bot" ? "chat-bubble-bot" : "chat-bubble-them"}`}>{m.text}</div>
              </div>
            ))}
          </div>

          <a href="mailto:ammadwork123@gmail.com" className="bot-cta">
            Book a free call <ArrowRight size={14} />
          </a>
        </div>
      )}

      <button className="bot-fab" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close Raabta Bot" : "Open Raabta Bot"}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Service card
// ─────────────────────────────────────────────────────────────────────────
function ServiceCard({ icon: Icon, title, desc, index }) {
  return (
    <Reveal delay={index * 80} className="h-full">
      <div className="service-card group h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="icon-chip">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <ArrowUpRight size={18} className="text-[#BFE3CC] group-hover:text-[#16A34A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
        <h3 className="font-serif text-[19px] font-semibold text-[#122019] mb-2 tracking-tight">{title}</h3>
        <p className="text-[13.5px] text-[#5B6B63] leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Phone mockup — light theme, WhatsApp-style chat thread
// ─────────────────────────────────────────────────────────────────────────
function PhoneMockup() {
  const messages = [
    { from: "them", text: "Hi, do you have a hall free for Dec 14?" },
    { from: "bot", text: "Yes! Grand Hall is open that evening. Want me to hold it?" },
    { from: "them", text: "Yes please" },
    { from: "bot", text: "Booked  Advance due Dec 1. Receipt sent below.", receipt: true },
  ];

  return (
    <div className="phone-frame">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-header">
        <div className="phone-avatar">R</div>
        <div>
          <p className="phone-header-title">Raabta Bot</p>
          <p className="phone-header-sub">online</p>
        </div>
      </div>
      <div className="phone-body">
        {messages.map((m, i) => (
          <Reveal key={i} delay={i * 180}>
            <div className={`chat-row ${m.from === "bot" ? "chat-row-bot" : "chat-row-them"}`}>
              <div className={`chat-bubble ${m.from === "bot" ? "chat-bubble-bot" : "chat-bubble-them"}`}>
                {m.text}
                {m.from === "bot" && (
                  <span className="chat-ticks">
                    <Check size={12} strokeWidth={3} />
                    <Check size={12} strokeWidth={3} style={{ marginLeft: -7 }} />
                  </span>
                )}
              </div>
            </div>
            {m.receipt && (
              <div className="chat-row chat-row-bot">
                <div className="chat-receipt">
                  <Receipt size={14} />
                  <span>Receipt_Darbar_1214.pdf</span>
                </div>
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Process step — simple numbered row, connected by the rail motif
// ─────────────────────────────────────────────────────────────────────────
function ProcessStep({ num, title, desc, index }) {
  return (
    <Reveal delay={index * 100}>
      <div className="process-step">
        <span className="process-num">{num}</span>
        <div>
          <h3 className="font-serif text-[19px] font-semibold text-[#122019] mb-1.5 tracking-tight">{title}</h3>
          <p className="text-[13.5px] text-[#5B6B63] leading-relaxed max-w-md">{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", (e) => {
      setScrollProgress(e.progress);
      setScrolled(e.scroll > 8);
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const scrollToAnchor = (e, targetId) => {
    e.preventDefault();
    if (!lenisRef.current) return;
    if (targetId === "#top") lenisRef.current.scrollTo(0, { duration: 1.2 });
    else lenisRef.current.scrollTo(targetId, { duration: 1.2, offset: -20 });
  };

  const services = [
    { icon: Code2, title: "Web Development", desc: "Fast, modern websites and web apps built to convert visitors into customers." },
    { icon: Smartphone, title: "Mobile Apps", desc: "iOS and Android apps for businesses that need their product in their customer's pocket." },
    { icon: Bot, title: "AI Automation", desc: "Custom workflows that handle support, follow-ups, and repetitive work your team shouldn't have to." },
    { icon: Target, title: "Lead Gen & CRM", desc: "Systems that find, capture, and nurture leads automatically." },
  ];

  const offers = [
    { icon: MessageCircle, title: "Custom Chatbot", desc: "Answers questions and qualifies leads like a team member." },
    { icon: CalendarClock, title: "Automated Reminders", desc: "Customers show up prepared, every time." },
    { icon: Ticket, title: "Booking Confirmations", desc: "Instant confirmation the moment an order lands." },
    { icon: PhoneCall, title: "Outreach & Follow-ups", desc: "Re-engage past customers with timely offers." },
    { icon: Bell, title: "Status Updates", desc: "Keep customers informed at every step." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }

        .font-serif { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes softPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .raabta-node-lit { animation: softPulse 2.4s ease-in-out infinite; }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(16px, -18px) scale(1.04); }
        }
        .drift-blob { animation: drift 16s ease-in-out infinite; }

        /* ── Connection rail ── */
        .raabta-rail { position: fixed; left: 32px; top: 0; bottom: 0; width: 20px; z-index: 40; align-items: center; pointer-events: none; }
        .raabta-rail-track { position: relative; width: 2px; height: 55vh; background: #DCFCE7; border-radius: 2px; }
        .raabta-rail-fill { position: absolute; top: 0; left: 0; width: 100%; background: #16A34A; border-radius: 2px; transition: height 120ms linear; }
        .raabta-node {
          position: absolute; left: 50%; width: 8px; height: 8px; border-radius: 50%;
          background: #DCFCE7; box-shadow: 0 0 0 2px #FFFFFF; transform: translate(-50%, -50%);
          transition: background 300ms ease;
        }
        .raabta-node-lit { background: #16A34A; box-shadow: 0 0 0 2px #FFFFFF, 0 0 10px rgba(22,163,74,0.5); }
        @media (max-width: 1023px) { .raabta-rail { display: none; } }

        /* ── Floating pill nav ── */
        .nav-wrap { position: sticky; top: 14px; z-index: 50; padding: 0 16px; }
        .nav-pill {
          max-width: 1040px; margin: 0 auto; background: rgba(255,255,255,0.85); backdrop-filter: blur(14px);
          border-radius: 999px; padding: 8px 10px 8px 22px; display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 20px -14px rgba(15,36,26,0.2); transition: box-shadow 300ms ease, background-color 300ms ease;
        }
        .nav-pill-scrolled { box-shadow: 0 16px 36px -20px rgba(15,36,26,0.3); background: rgba(255,255,255,0.95); }
        .nav-mobile-sheet {
          max-width: 1040px; margin: 8px auto 0; background: #FFFFFF; border-radius: 24px; padding: 16px 22px;
          box-shadow: 0 16px 36px -20px rgba(15,36,26,0.28);
        }

        .icon-chip {
          width: 44px; height: 44px; border-radius: 12px; background: #F0FDF4; color: #16A34A;
          display: flex; align-items: center; justify-content: center;
        }
        .badge-pill {
          display: inline-flex; align-items: center; gap: 7px; background: #F0FDF4; color: #15803D;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.02em; padding: 7px 14px; border-radius: 999px;
        }

        .cta-btn { transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease; }
        .cta-btn:hover { transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0px) scale(0.98); }

        /* ── Services ── */
        .service-card {
          background: #FFFFFF; border-radius: 20px; padding: 28px;
          box-shadow: 0 2px 14px -8px rgba(15,36,26,0.1); transition: box-shadow 300ms ease, transform 300ms ease;
        }
        .service-card:hover { box-shadow: 0 18px 40px -18px rgba(15,36,26,0.22); transform: translateY(-4px); }

        .offer-chip {
          background: #FFFFFF; border-radius: 16px; padding: 18px;
          box-shadow: 0 2px 12px -8px rgba(15,36,26,0.08); transition: box-shadow 250ms ease, transform 250ms ease;
        }
        .offer-chip:hover { box-shadow: 0 14px 30px -16px rgba(15,36,26,0.2); transform: translateY(-2px); }

        /* ── Video (simple) ── */
        .video-frame {
          position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 16 / 9;
          background: #E9F9EF; box-shadow: 0 24px 60px -28px rgba(15,36,26,0.28); cursor: pointer; max-width: 720px; margin: 0 auto;
        }
        .video-el { width: 100%; height: 100%; object-fit: contain; display: block; background: #E9F9EF; }
        .video-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15,36,26,0.06); }
        .video-play-btn {
          width: 66px; height: 66px; border-radius: 50%; background: #16A34A; color: #FFFFFF; display: flex;
          align-items: center; justify-content: center; border: none; cursor: pointer;
          box-shadow: 0 16px 34px -12px rgba(22,163,74,0.55); transition: transform 200ms ease, background-color 200ms ease;
        }
        .video-play-btn:hover { transform: scale(1.06); background: #15803D; }

        /* ── Phone mockup (light) ── */
        .phone-frame {
          background: #FFFFFF; border-radius: 34px; padding: 12px; max-width: 300px; margin: 0 auto;
          box-shadow: 0 30px 70px -30px rgba(15,36,26,0.3);
        }
        .phone-notch { width: 64px; height: 5px; border-radius: 3px; background: #E3F1E9; margin: 0 auto 10px; }
        .phone-header { display: flex; align-items: center; gap: 10px; padding: 4px 8px 14px; }
        .phone-avatar {
          width: 32px; height: 32px; border-radius: 50%; background: #16A34A; color: white;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center;
        }
        .phone-header-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #122019; }
        .phone-header-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #16A34A; }
        .phone-body {
          background: #F0FDF4; border-radius: 18px; padding: 16px 12px; min-height: 320px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .chat-row { display: flex; }
        .chat-row-them { justify-content: flex-end; }
        .chat-row-bot { justify-content: flex-start; }
        .chat-bubble {
          max-width: 80%; font-family: 'Inter', sans-serif; font-size: 12.5px; line-height: 1.4;
          padding: 9px 12px; border-radius: 14px; position: relative;
        }
        .chat-bubble-them { background: #FFFFFF; color: #122019; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px -4px rgba(15,36,26,0.15); }
        .chat-bubble-bot { background: #16A34A; color: #FFFFFF; border-bottom-left-radius: 4px; font-weight: 500; }
        .chat-ticks { display: inline-flex; margin-left: 6px; color: #DCFCE7; vertical-align: middle; }
        .chat-receipt {
          display: flex; align-items: center; gap: 7px; background: #FFFFFF; color: #15803D; font-size: 11px;
          font-family: 'JetBrains Mono', monospace; padding: 8px 12px; border-radius: 12px; margin-top: -2px;
          box-shadow: 0 2px 8px -4px rgba(15,36,26,0.12);
        }

        /* ── Process ── */
        .process-step { display: grid; grid-template-columns: 56px 1fr; gap: 20px; padding: 22px 0; align-items: start; }
        .process-num {
          font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #16A34A;
          width: 44px; height: 44px; border-radius: 12px; background: #F0FDF4; display: flex; align-items: center; justify-content: center;
        }

        /* ── CTA (light card, no dark panel) ── */
        .cta-section { background: #F0FDF4; }
        .cta-card {
          background: #FFFFFF; border-radius: 28px; padding: 48px 32px; text-align: center; max-width: 640px; margin: 0 auto;
          box-shadow: 0 30px 70px -32px rgba(15,36,26,0.25);
        }

        /* ── Raabta Bot widget ── */
        .bot-widget { position: fixed; bottom: 22px; right: 22px; z-index: 60; display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
        .bot-fab {
          width: 56px; height: 56px; border-radius: 50%; background: #16A34A; color: #FFFFFF; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; box-shadow: 0 16px 34px -12px rgba(22,163,74,0.5);
          transition: transform 200ms ease, background-color 200ms ease;
        }
        .bot-fab:hover { transform: scale(1.06); background: #15803D; }
        .bot-panel {
          width: min(320px, 84vw); background: #FFFFFF; border-radius: 20px;
          box-shadow: 0 30px 70px -24px rgba(15,36,26,0.35); overflow: hidden; display: flex; flex-direction: column;
        }
        .bot-panel-header { display: flex; align-items: center; gap: 10px; background: #16A34A; padding: 14px; }
        .bot-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .bot-panel-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; }
        .bot-panel-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #DCFCE7; }
        .bot-close { background: transparent; border: none; color: #FFFFFF; cursor: pointer; padding: 4px; }
        .bot-panel-body { padding: 16px 12px; display: flex; flex-direction: column; gap: 10px; min-height: 220px; background: #F0FDF4; }
        .bot-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px; background: #16A34A; color: #FFFFFF;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; padding: 13px; text-decoration: none;
          transition: background-color 200ms ease;
        }
        .bot-cta:hover { background: #15803D; }

        @media (prefers-reduced-motion: reduce) {
          .drift-blob, .raabta-node-lit { animation: none !important; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      <RaabtaLine progress={scrollProgress} />

      {/* ── Floating pill nav ── */}
      <div className="nav-wrap">
        <div className={`nav-pill ${scrolled ? "nav-pill-scrolled" : ""}`}>
          <a href="#top" onClick={(e) => scrollToAnchor(e, "#top")} className="flex items-center gap-2">
            <span className="font-serif text-[19px] font-semibold text-[#122019] tracking-tight">Raabta</span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">Services</a>
            <a href="#whatsapp" onClick={(e) => scrollToAnchor(e, "#whatsapp")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">WhatsApp Automation</a>
            <a href="#process" onClick={(e) => scrollToAnchor(e, "#process")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">Process</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-[13px] font-medium text-[#5B6B63] hover:text-[#16A34A] transition-colors px-2">Login</a>
            <a href="#contact" onClick={(e) => scrollToAnchor(e, "#contact")} className="cta-btn bg-[#16A34A] hover:bg-[#15803D] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full">
              Book a call
            </a>
          </div>

          <button className="md:hidden text-[#122019] pr-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden nav-mobile-sheet flex flex-col gap-4">
            <a href="#services" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#services"); }} className="text-[14px] font-medium text-[#3F4B45]">Services</a>
            <a href="#whatsapp" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#whatsapp"); }} className="text-[14px] font-medium text-[#3F4B45]">WhatsApp Automation</a>
            <a href="#process" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#process"); }} className="text-[14px] font-medium text-[#3F4B45]">Process</a>
            <a href="/login" className="text-[14px] font-medium text-[#5B6B63]">Login</a>
            <a href="#contact" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#contact"); }} className="cta-btn bg-[#16A34A] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full text-center">
              Book a call
            </a>
          </div>
        )}
      </div>

      {/* ── Hero — centered copy, simple video below ── */}
      <section id="top" className="relative max-w-4xl mx-auto px-6 pt-16 pb-20 text-center overflow-hidden">
        <div
          className="drift-blob absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full opacity-70 pointer-events-none -z-10"
          style={{ background: "radial-gradient(circle, #DCFCE7 0%, transparent 70%)" }}
        />

       

        <Reveal delay={120}>
          <h1 className="font-serif text-[38px] sm:text-[48px] lg:text-[56px] font-semibold text-[#122019] leading-[1.08] tracking-tight mb-6">
            Every customer,
            <br />
            <span className="text-[#16A34A]">one raabta away.</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-[16px] text-[#5B6B63] leading-relaxed max-w-xl mx-auto mb-9">
            We build the websites, apps, and AI-driven WhatsApp systems that keep your
            business responsive around the clock  so no lead goes cold and no booking slips through.
          </p>
        </Reveal>

        <Reveal delay={280}>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a href="#contact" onClick={(e) => scrollToAnchor(e, "#contact")} className="cta-btn bg-[#16A34A] hover:bg-[#15803D] text-white text-[14px] font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2">
              Book a free call <ArrowRight size={16} />
            </a>
            <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="cta-btn text-[#122019] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[14px] font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2">
              See what we build
            </a>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <DemoVideo />
        </Reveal>
      </section>

      {/* ── Services ── */}
      <section id="services" className="max-w-6xl mx-auto px-6 pb-24 lg:pl-24">
        <Reveal>
          <div className="mb-12 max-w-xl">
            <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">WHAT WE BUILD</p>
            <h2 className="font-serif text-[28px] sm:text-[34px] font-semibold text-[#122019] tracking-tight leading-tight">
              One partner for every piece of your growth stack
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* ── WhatsApp Automation ── */}
      <section id="whatsapp" className="bg-[#F0FDF4] py-24">
        <div className="max-w-6xl mx-auto px-6 lg:pl-24">
          <Reveal>
            <div className="max-w-lg mb-14">
              <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">FLAGSHIP CAPABILITY</p>
              <h2 className="font-serif text-[26px] sm:text-[30px] font-semibold text-[#122019] tracking-tight leading-tight mb-4">
                WhatsApp automation, built around your business
              </h2>
              <p className="text-[13.5px] text-[#5B6B63] leading-relaxed">
                A custom chatbot that runs your bookings, receipts, and follow-ups — where your
                customers already are. Here's what a real booking looks like, start to finish.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-center">
            <Reveal delay={100}>
              <PhoneMockup />
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((o, i) => (
                <Reveal key={o.title} delay={i * 60}>
                  <div className="offer-chip group">
                    <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#16A34A] mb-3 group-hover:bg-[#16A34A] group-hover:text-white transition-colors duration-300">
                      <o.icon size={17} strokeWidth={2} />
                    </div>
                    <h4 className="font-sans text-[13.5px] font-semibold text-[#122019] mb-1 tracking-tight">{o.title}</h4>
                    <p className="text-[12px] text-[#5B6B63] leading-relaxed">{o.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="max-w-3xl mx-auto px-6 py-24 lg:pl-24">
        <Reveal>
          <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">HOW WE WORK</p>
          <h2 className="font-serif text-[28px] sm:text-[34px] font-semibold text-[#122019] tracking-tight leading-tight mb-4">
            Four steps from idea to a system that runs itself
          </h2>
        </Reveal>

        <div>
          <ProcessStep num="01" index={0} title="Discover" desc="We map your workflow and find where automation and better software actually move the needle." />
          <ProcessStep num="02" index={1} title="Build" desc="Design and development happen in tandem, with working versions in your hands early and often." />
          <ProcessStep num="03" index={2} title="Launch" desc="We ship, connect it to your real data, and make sure it holds up under real customer traffic." />
          <ProcessStep num="04" index={3} title="Grow" desc="We keep tuning the system as your business changes — it's a partnership, not a handoff." />
        </div>
      </section>

      {/* ── Closing CTA — light card, no dark panel ── */}
      <section id="contact" className="cta-section py-24 px-6">
        <Reveal>
          <div className="cta-card">
            <span className="badge-pill mb-6">
              <DollarSign size={12} /> LET'S TALK
            </span>
            <h2 className="font-serif text-[28px] sm:text-[34px] font-semibold text-[#122019] tracking-tight leading-tight mb-4">
              Let's build your raabta.
            </h2>
            <p className="text-[15px] text-[#5B6B63] leading-relaxed mb-8 max-w-md mx-auto">
              Tell us where your customers are falling through the cracks. We'll tell you
              exactly what we'd build to fix it — no obligation.
            </p>
            <a href="mailto:ammadwork123@gmail.com" className="cta-btn inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-[14px] font-semibold px-6 py-3.5 rounded-xl">
              Book a free call <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:pl-24 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
            <div className="md:col-span-5">
              <span className="font-serif text-[20px] font-semibold text-[#122019] tracking-tight">Raabta</span>
              <p className="text-[13.5px] text-[#5B6B63] leading-relaxed mt-3 max-w-xs">
                A studio building web, mobile, and AI automation for businesses
                that want to connect with more customers, automatically.
              </p>
            </div>

            <div className="md:col-span-3">
              <p className="font-mono text-[11px] text-[#8B978F] font-medium tracking-wider mb-4">EXPLORE</p>
              <div className="flex flex-col gap-3">
                <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">Services</a>
                <a href="#whatsapp" onClick={(e) => scrollToAnchor(e, "#whatsapp")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">WhatsApp Automation</a>
                <a href="#process" onClick={(e) => scrollToAnchor(e, "#process")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">Process</a>
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="font-mono text-[11px] text-[#8B978F] font-medium tracking-wider mb-4">GET IN TOUCH</p>
              <div className="flex flex-col gap-3">
                <a href="mailto:ammadwork123@gmail.com" className="flex items-center gap-2.5 text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">
                  <Mail size={15} strokeWidth={1.75} /> ammadwork123@gmail.com
                </a>
                <a href="tel:+923133125027" className="flex items-center gap-2.5 text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">
                  <Phone size={15} strokeWidth={1.75} /> 0313 3125027
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-[#8B978F] font-mono">© 2026 Raabta — connecting businesses to their customers.</p>
            <a href="#top" onClick={(e) => scrollToAnchor(e, "#top")} className="flex items-center gap-1.5 text-[12px] font-mono text-[#5B6B63] hover:text-[#16A34A] transition-colors">
              Back to top <ArrowUp size={13} />
            </a>
          </div>
        </div>
      </footer>

      <RaabtaBot />
    </div>
  );
}