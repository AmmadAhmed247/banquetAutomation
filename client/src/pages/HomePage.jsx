import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import {
  MessageCircle,
  CalendarClock,
  Ticket,
  Bell,
  Receipt,
  PhoneCall,
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
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Quote,
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
        transform: visible ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The Raabta Line — a scroll-progress "connection thread" with lit nodes.
// This is the site's throughline: connection, made literal. It reappears
// as the process timeline's spine and the phone mockup's chat thread.
// ─────────────────────────────────────────────────────────────────────────
function RaabtaLine({ progress }) {
  const nodes = [0, 0.22, 0.46, 0.7, 0.94];
  return (
    <div className="raabta-rail hidden lg:flex" aria-hidden="true">
      <div className="raabta-rail-track">
        <div
          className="raabta-rail-fill"
          style={{ height: `${Math.min(progress * 100, 100)}%` }}
        />
        {nodes.map((n, i) => (
          <div
            key={i}
            className={`raabta-node ${progress >= n ? "raabta-node-lit" : ""}`}
            style={{ top: `${n * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Demo video card — styled like a WhatsApp video call in progress.
// Plays WITH sound on click. Swap the <source> for your own file.
// ─────────────────────────────────────────────────────────────────────────
function DemoVideoCard() {
  const videoRef = useRef(null);
  const tiltRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleTiltMove = (e) => {
    const el = tiltRef.current;
    if (!el || window.innerWidth < 1024) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {});
    setMuted(false);
    setPlaying(true);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div
      ref={tiltRef}
      className="tilt-wrap"
      onMouseMove={handleTiltMove}
      onMouseLeave={resetTilt}
      style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className="demo-card">
        <div className="demo-card-bar">
          <span className="demo-dot" aria-hidden="true" />
          <span className="demo-card-title">Raabta — live demo</span>
          <span className="demo-card-timer">
            {playing ? formatTime(elapsed) : "0:42"}
          </span>
        </div>

        <div
          className="demo-card-frame"
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
            className="demo-video"
            playsInline
            controls={playing}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setElapsed(0);
            }}
          >
            {/* Replace with your own video file */}
            <source src="/promo.mp4" type="video/mp4" />
          </video>

          {!playing && (
            <div className="demo-play-overlay">
              <button className="demo-play-btn" aria-label="Play demo video">
                <Play size={30} fill="currentColor" style={{ marginLeft: 4 }} />
              </button>
              <span className="demo-play-label">Watch how it works — with sound</span>
            </div>
          )}

          {playing && (
            <button
              className="demo-mute-btn"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Floating orbs — CSS-only pseudo-3D depth for the hero. Layered
// gradients + inset shadows fake a lit sphere; slow float + rotation
// keyframes give it dimensional motion without a 3D library.
// ─────────────────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="orb-field" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Bento service card — supports a "feature" size for the wide/tall tile.
// ─────────────────────────────────────────────────────────────────────────
function ServiceCard({ icon: Icon, title, desc, index }) {
  return (
    <Reveal delay={index * 80} className="h-full">
      <div className="service-card group h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="pillar-icon">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <ArrowUpRight
            size={18}
            className="text-[#C6DED0] group-hover:text-[#16A34A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
          />
        </div>
        <h3 className="font-serif text-[19px] font-semibold text-[#0B1F17] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[13.5px] text-[#5B6B63] leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Phone mockup — a stylized WhatsApp-style chat thread, animating in on
// scroll. Ties the offer list to something tangible.
// ─────────────────────────────────────────────────────────────────────────
function PhoneMockup() {
  const messages = [
    { from: "them", text: "Hi, do you have a hall free for Dec 14?" },
    { from: "bot", text: "Yes! Grand Hall is open that evening. Want me to hold it?" },
    { from: "them", text: "Yes please" },
    { from: "bot", text: "Booked ✅ Advance due Dec 1. Receipt sent below.", receipt: true },
  ];

  return (
    <div className="phone-frame">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-header">
        <div className="phone-avatar">R</div>
        <div>
          <p className="phone-header-title">Darbar Banquet</p>
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
// Connected timeline step — alternating sides, joined by a central spine.
// ─────────────────────────────────────────────────────────────────────────
function TimelineStep({ num, title, desc, side }) {
  return (
    <div className={`timeline-row timeline-row-${side}`}>
      <Reveal delay={parseInt(num) * 100} className="timeline-card-wrap">
        <div className="timeline-card">
          <span className="font-mono text-[11.5px] text-[#16A34A] font-semibold tracking-wider">
            STEP {num}
          </span>
          <h3 className="font-serif text-[21px] font-semibold text-[#0B1F17] mt-2 mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-[13.5px] text-[#5B6B63] leading-relaxed">{desc}</p>
        </div>
      </Reveal>
      <div className="timeline-node-wrap" aria-hidden="true">
        <span className="timeline-node" />
      </div>
      <div className="timeline-spacer" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Testimonial — single quote, kept small on purpose.
// ⚠️ PLACEHOLDER QUOTE — swap in Darbar Banquet's actual words before
// this goes live. Nothing here should be treated as a real review yet.
// ─────────────────────────────────────────────────────────────────────────
function Testimonial() {
  return (
    <Reveal className="max-w-2xl mx-auto">
      <div className="testimonial-card">
        <Quote size={26} className="text-[#16A34A] mb-4" strokeWidth={1.5} />
        <p className="font-serif text-[19px] sm:text-[22px] text-[#0B1F17] leading-snug tracking-tight mb-6">
          "{/* TODO: replace with the real Darbar Banquet quote */}
          Since the WhatsApp system went live, we stopped missing bookings 
          every enquiry gets an instant reply, even after hours."
        </p>
        <div className="flex items-center gap-3">
          <div className="testimonial-avatar">D</div>
          <div>
            <p className="text-[13.5px] font-semibold text-[#0B1F17]">Darbar Banquet</p>
            <p className="text-[12px] text-[#8B978F] font-mono">Banquet hall, Karachi</p>
          </div>
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

    return () => {
      lenis.destroy();
    };
  }, []);

  const scrollToAnchor = (e, targetId) => {
    e.preventDefault();
    if (lenisRef.current) {
      if (targetId === "#top") {
        lenisRef.current.scrollTo(0, { duration: 1.2 });
      } else {
        lenisRef.current.scrollTo(targetId, { duration: 1.2, offset: -20 });
      }
    }
  };

  const services = [
    {
      icon: Code2,
      title: "Web Development",
      desc: "Fast, modern websites and web apps built to convert visitors into customers — not just look good.",
    },
    {
      icon: Smartphone,
      title: "Mobile Apps",
      desc: "iOS and Android apps for businesses that need their product in their customer's pocket.",
    },
    {
      icon: Bot,
      title: "AI Automation",
      desc: "Custom AI workflows that handle support, follow-ups, and repetitive work your team shouldn't have to.",
    },
    {
      icon: Target,
      title: "Lead Generation & CRM",
      desc: "Systems that find, capture, and nurture leads automatically, with a dashboard that shows what's working.",
    },
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

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -24px) scale(1.05); }
        }
        .drift-blob { animation: drift 14s ease-in-out infinite; }

        @keyframes softPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .raabta-node-lit { animation: softPulse 2.4s ease-in-out infinite; }
        .demo-dot { animation: softPulse 2s ease-in-out infinite; }

        /* ── Connection rail (desktop) ── */
        .raabta-rail {
          position: fixed;
          left: 32px;
          top: 0;
          bottom: 0;
          width: 20px;
          z-index: 40;
          align-items: center;
          pointer-events: none;
        }
        .raabta-rail-track {
          position: relative;
          width: 2px;
          height: 55vh;
          background: #E3F1E9;
          border-radius: 2px;
        }
        .raabta-rail-fill {
          position: absolute;
          top: 0; left: 0; width: 100%;
          background: linear-gradient(180deg, #16A34A, #0B7A38);
          border-radius: 2px;
          transition: height 120ms linear;
        }
        .raabta-node {
          position: absolute;
          left: 50%;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #E3F1E9;
          border: 2px solid #FFFFFF;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 1px #D8EEE0;
          transition: background 300ms ease;
        }
        .raabta-node-lit {
          background: #16A34A;
          box-shadow: 0 0 0 1px #16A34A, 0 0 12px rgba(22,163,74,0.5);
        }

        /* ── Floating pill nav ── */
        .nav-wrap { position: sticky; top: 14px; z-index: 50; padding: 0 16px; }
        .nav-pill {
          max-width: 1040px;
          margin: 0 auto;
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(14px);
          border: 1px solid #E9F5EE;
          border-radius: 999px;
          padding: 8px 10px 8px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: box-shadow 300ms ease, border-color 300ms ease, background-color 300ms ease;
        }
        .nav-pill-scrolled {
          box-shadow: 0 16px 40px -22px rgba(11,31,23,0.4);
          border-color: #DCEFE3;
          background: rgba(255,255,255,0.92);
        }
        .nav-mobile-sheet {
          max-width: 1040px;
          margin: 8px auto 0;
          background: #FFFFFF;
          border: 1px solid #E9F5EE;
          border-radius: 24px;
          padding: 16px 22px;
          box-shadow: 0 16px 40px -22px rgba(11,31,23,0.35);
        }

        .pillar-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #F2FBF5;
          color: #16A34A;
          display: flex; align-items: center; justify-content: center;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #F2FBF5;
          border: 1px solid #DCEFE3;
          color: #0B7A38;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.02em;
          padding: 7px 14px;
          border-radius: 999px;
        }

        /* ── Proof marquee ── */
        .marquee-mask {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          gap: 44px;
          animation: marquee 22s linear infinite;
        }
        .marquee-mask:hover .marquee-track { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #8B978F;
          white-space: nowrap;
        }

        /* ── Services grid (simple, equal cards) ── */
        .service-card {
          background: #FFFFFF;
          border: 1px solid #E3F1E9;
          border-radius: 20px;
          padding: 28px;
          transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
        }
        .service-card:hover {
          border-color: #16A34A;
          box-shadow: 0 16px 40px -20px rgba(11,31,23,0.25);
          transform: translateY(-4px);
        }

        .offer-chip {
          background: #FBFDFC;
          border: 1px solid #E9F5EE;
          border-radius: 16px;
          padding: 18px;
          transition: border-color 250ms ease, transform 250ms ease;
        }
        .offer-chip:hover { border-color: #16A34A; transform: translateY(-2px); }

        .cta-btn { transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease; }
        .cta-btn:hover { transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0px) scale(0.98); }

        /* ── 3D tilt wrapper for the demo card ── */
        .tilt-wrap {
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
          will-change: transform;
        }
        @media (max-width: 1023px) {
          .tilt-wrap { transform: none !important; }
        }

        /* ── Floating orbs (pseudo-3D hero depth) ── */
        .orb-field { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .orb {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, #DCF5E4 0%, #16A34A 55%, #0B7A38 100%);
          box-shadow: inset -12px -14px 26px rgba(6,20,13,0.35), 0 24px 50px -18px rgba(11,31,23,0.4);
        }
        .orb-1 { width: 64px; height: 64px; top: 6%; right: 6%; opacity: 0.9; animation: float3d 9s ease-in-out infinite; }
        .orb-2 { width: 34px; height: 34px; top: 42%; right: 18%; opacity: 0.7; animation: float3d 7s ease-in-out infinite -2s; }
        .orb-3 { width: 22px; height: 22px; top: 20%; left: 46%; opacity: 0.55; animation: float3d 11s ease-in-out infinite -4s; }
        @keyframes float3d {
          0%, 100% { transform: translate3d(0, 0, 0) rotateZ(0deg) scale(1); }
          33% { transform: translate3d(14px, -18px, 0) rotateZ(8deg) scale(1.05); }
          66% { transform: translate3d(-12px, 10px, 0) rotateZ(-6deg) scale(0.97); }
        }
        @media (max-width: 1023px) {
          .orb-field { display: none; }
        }

        /* ── Testimonial ── */
        .testimonial-card {
          background: #FBFDFC;
          border: 1px solid #E9F5EE;
          border-radius: 24px;
          padding: 36px;
          text-align: center;
        }
        .testimonial-card p { text-align: left; }
        .testimonial-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #16A34A; color: white; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Demo video card ── */
        .demo-card {
          background: #0B1F17;
          border-radius: 30px;
          padding: 14px;
          box-shadow: 0 50px 100px -32px rgba(11,31,23,0.5);
          max-width: 560px;
          margin: 0 auto;
        }
        .demo-card-bar { display: flex; align-items: center; gap: 10px; padding: 8px 14px 16px; }
        .demo-dot { width: 9px; height: 9px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 0 3px rgba(22,163,74,0.22); flex-shrink: 0; }
        .demo-card-title { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: #B9D9C6; flex: 1; letter-spacing: 0.01em; }
        .demo-card-timer { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #6FA98A; }
        .demo-card-frame {
          position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 5 / 4;
          background: linear-gradient(135deg, #123321 0%, #0B1F17 100%); cursor: pointer;
        }
        .demo-video { width: 100%; height: 100%; object-fit: contain; display: block; background: #0B1F17; }
        .demo-play-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 16px; background: rgba(6,20,13,0.32);
        }
        .demo-play-btn {
          width: 84px; height: 84px; border-radius: 50%; background: #16A34A; color: white; display: flex;
          align-items: center; justify-content: center; border: none; cursor: pointer;
          box-shadow: 0 18px 40px -12px rgba(22,163,74,0.65); transition: transform 200ms ease, background-color 200ms ease;
        }
        .demo-play-btn:hover { transform: scale(1.08); background: #0B7A38; }
        .demo-play-label { font-family: 'Inter', sans-serif; font-size: 14px; color: #EAF7EF; font-weight: 600; }
        .demo-mute-btn {
          position: absolute; bottom: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%;
          background: rgba(6,20,13,0.55); color: #EAF7EF; border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        /* ── Phone mockup (WhatsApp-style thread) ── */
        .phone-frame {
          background: #0B1F17;
          border-radius: 34px;
          padding: 12px;
          max-width: 320px;
          margin: 0 auto;
          box-shadow: 0 40px 80px -30px rgba(11,31,23,0.45);
        }
        .phone-notch {
          width: 70px; height: 5px; border-radius: 3px;
          background: rgba(255,255,255,0.18);
          margin: 0 auto 10px;
        }
        .phone-header {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .phone-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #16A34A; color: white; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
        }
        .phone-header-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #EAF7EF; }
        .phone-header-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6FA98A; }
        .phone-body {
          background: linear-gradient(180deg, #0F2A1D 0%, #0B1F17 100%);
          border-radius: 18px; padding: 16px 12px; min-height: 340px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .chat-row { display: flex; }
        .chat-row-them { justify-content: flex-end; }
        .chat-row-bot { justify-content: flex-start; }
        .chat-bubble {
          max-width: 78%; font-family: 'Inter', sans-serif; font-size: 12.5px; line-height: 1.4;
          padding: 9px 12px; border-radius: 14px; position: relative;
        }
        .chat-bubble-them { background: #1B4230; color: #EAF7EF; border-bottom-right-radius: 4px; }
        .chat-bubble-bot { background: #16A34A; color: #FFFFFF; border-bottom-left-radius: 4px; font-weight: 500; }
        .chat-ticks { display: inline-flex; margin-left: 6px; color: #CFF2DC; vertical-align: middle; }
        .chat-receipt {
          display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12); color: #B9D9C6; font-size: 11px;
          font-family: 'JetBrains Mono', monospace; padding: 8px 12px; border-radius: 12px; margin-top: -2px;
        }

        /* ── Connected timeline ── */
        .timeline-wrap { position: relative; }
        .timeline-spine {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
          background: repeating-linear-gradient(180deg, #DCEFE3 0, #DCEFE3 6px, transparent 6px, transparent 12px);
          transform: translateX(-50%);
          display: none;
        }
        .timeline-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 28px 0;
        }
        @media (min-width: 1024px) {
          .timeline-spine { display: block; }
          .timeline-row {
            grid-template-columns: 1fr 40px 1fr;
            align-items: center;
          }
          .timeline-row-left .timeline-card-wrap { grid-column: 1; text-align: right; }
          .timeline-row-left .timeline-spacer { grid-column: 3; }
          .timeline-row-right .timeline-card-wrap { grid-column: 3; }
          .timeline-row-right .timeline-spacer { grid-column: 1; }
          .timeline-node-wrap { grid-column: 2; display: flex; justify-content: center; }
        }
        .timeline-node-wrap { display: none; }
        @media (min-width: 1024px) { .timeline-node-wrap { display: flex; } }
        .timeline-node {
          width: 14px; height: 14px; border-radius: 50%;
          background: #16A34A; box-shadow: 0 0 0 5px #F2FBF5, 0 0 0 6px #DCEFE3;
        }
        .timeline-card {
          background: #FFFFFF; border: 1px solid #E3F1E9; border-radius: 20px; padding: 24px;
          transition: border-color 300ms ease, box-shadow 300ms ease;
        }
        .timeline-card:hover { border-color: #16A34A; box-shadow: 0 16px 36px -22px rgba(11,31,23,0.25); }

        /* ── CTA mesh panel ── */
        .cta-panel {
          position: relative;
          background:
            radial-gradient(600px 300px at 15% 20%, rgba(22,163,74,0.35), transparent 60%),
            radial-gradient(500px 260px at 85% 80%, rgba(11,122,56,0.4), transparent 60%),
            #06331F;
        }
        .cta-dots {
          position: absolute; inset: 0; opacity: 0.5; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px);
          background-size: 22px 22px;
          mask-image: radial-gradient(circle at 30% 40%, black, transparent 70%);
        }

        @media (prefers-reduced-motion: reduce) {
          .drift-blob, .raabta-node-lit, .demo-dot, .marquee-track { animation: none !important; }
          * { transition-duration: 0.01ms !important; }
        }

        @media (max-width: 1023px) {
          .raabta-rail { display: none; }
        }
      `}</style>

      <RaabtaLine progress={scrollProgress} />

      {/* ── Floating pill nav ── */}
      <div className="nav-wrap">
        <div className={`nav-pill ${scrolled ? "nav-pill-scrolled" : ""}`}>
          <a href="#top" onClick={(e) => scrollToAnchor(e, "#top")} className="flex items-center gap-2">
            <span className="font-serif text-[19px] font-semibold text-[#0B1F17] tracking-tight">
              Raabta
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7">
            <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              Services
            </a>
            <a href="#whatsapp" onClick={(e) => scrollToAnchor(e, "#whatsapp")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              WhatsApp Automation
            </a>
            <a href="#process" onClick={(e) => scrollToAnchor(e, "#process")} className="text-[13px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              Process
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-[13px] font-medium text-[#5B6B63] hover:text-[#16A34A] transition-colors px-2">
              Login
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToAnchor(e, "#contact")}
              className="cta-btn bg-[#0B1F17] hover:bg-[#16A34A] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full"
            >
              Book a call
            </a>
          </div>

          <button
            className="md:hidden text-[#0B1F17] pr-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden nav-mobile-sheet flex flex-col gap-4">
            <a href="#services" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#services"); }} className="text-[14px] font-medium text-[#3F4B45]">Services</a>
            <a href="#whatsapp" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#whatsapp"); }} className="text-[14px] font-medium text-[#3F4B45]">WhatsApp Automation</a>
            <a href="#process" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#process"); }} className="text-[14px] font-medium text-[#3F4B45]">Process</a>
            <a href="/login" className="text-[14px] font-medium text-[#5B6B63]">Login</a>
            <a href="#contact" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#contact"); }} className="cta-btn bg-[#0B1F17] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full text-center">
              Book a call
            </a>
          </div>
        )}
      </div>

      {/* ── Hero ── */}
      <section id="top" className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pl-24 overflow-hidden">
        <div
          className="drift-blob absolute -top-20 right-0 w-[420px] h-[420px] rounded-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #DCF5E4 0%, transparent 70%)" }}
        />
        <FloatingOrbs />

        <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-12 items-center">
          <div>
            

            <Reveal delay={120}>
              <h1 className="font-serif text-[40px] sm:text-[52px] lg:text-[62px] font-semibold text-[#0B1F17] leading-[1.05] tracking-tight mb-6">
                Every customer,
                <br />
                <span className="text-[#16A34A]">one raabta away.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-[16px] text-[#5B6B63] leading-relaxed max-w-xl mb-9">
                We build the websites, apps, and AI-driven WhatsApp systems that keep your
                business responsive around the clock — so no lead goes cold and no booking
                slips through.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  onClick={(e) => scrollToAnchor(e, "#contact")}
                  className="cta-btn bg-[#16A34A] hover:bg-[#0B7A38] text-white text-[14px] font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2"
                >
                  Book a free call <ArrowRight size={16} />
                </a>
                <a
                  href="#services"
                  onClick={(e) => scrollToAnchor(e, "#services")}
                  className="cta-btn text-[#0B1F17] text-[14px] font-semibold px-6 py-3.5 rounded-xl border border-[#DCEFE3] hover:border-[#16A34A] flex items-center gap-2"
                >
                  See what we build
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={220}>
            <DemoVideoCard />
          </Reveal>
        </div>
      </section>

      {/* ── Service Bento Grid ── */}
      <section id="services" className="max-w-6xl mx-auto px-6 pb-24 lg:pl-24">
        <Reveal>
          <div className="mb-12 max-w-xl">
            <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">
              WHAT WE BUILD
            </p>
            <h2 className="font-serif text-[30px] sm:text-[36px] font-semibold text-[#0B1F17] tracking-tight leading-tight">
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

      {/* ── WhatsApp Automation deep-dive ── */}
      <section id="whatsapp" className="bg-[#F7FCF9] border-y border-[#E9F5EE] py-24">
        <div className="max-w-6xl mx-auto px-6 lg:pl-24">
          <Reveal>
            <div className="max-w-lg mb-14">
              <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">
                FLAGSHIP CAPABILITY
              </p>
              <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold text-[#0B1F17] tracking-tight leading-tight mb-4">
                WhatsApp automation, built around your business
              </h2>
              <p className="text-[13.5px] text-[#5B6B63] leading-relaxed">
                A custom chatbot that runs your bookings, receipts, and follow-ups —
                where your customers already are. Here's what a real booking looks like,
                start to finish.
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
                    <div className="w-9 h-9 rounded-lg bg-[#F2FBF5] flex items-center justify-center text-[#16A34A] mb-3 group-hover:bg-[#16A34A] group-hover:text-white transition-colors duration-300">
                      <o.icon size={17} strokeWidth={2} />
                    </div>
                    <h4 className="font-sans text-[13.5px] font-semibold text-[#0B1F17] mb-1 tracking-tight">
                      {o.title}
                    </h4>
                    <p className="text-[12px] text-[#5B6B63] leading-relaxed">{o.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process — connected timeline ── */}
      <section id="process" className="max-w-6xl mx-auto px-6 py-24 lg:pl-24">
        <Reveal>
          <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">
            HOW WE WORK
          </p>
          <h2 className="font-serif text-[30px] sm:text-[36px] font-semibold text-[#0B1F17] tracking-tight leading-tight mb-4 max-w-xl">
            Four steps from idea to a system that runs itself
          </h2>
        </Reveal>

        <div className="timeline-wrap">
          <div className="timeline-spine" aria-hidden="true" />
          <TimelineStep num="01" side="left" title="Discover" desc="We map your workflow and find where automation and better software actually move the needle." />
          <TimelineStep num="02" side="right" title="Build" desc="Design and development happen in tandem, with working versions in your hands early and often." />
          <TimelineStep num="03" side="left" title="Launch" desc="We ship, connect it to your real data, and make sure it holds up under real customer traffic." />
          <TimelineStep num="04" side="right" title="Grow" desc="We keep tuning the system as your business changes — it's a partnership, not a handoff." />
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 lg:pl-24">
        <Testimonial />
      </section>

      {/* ── Closing CTA ── */}
      <section id="contact" className="mx-6 lg:mx-24 mb-6 rounded-[28px] cta-panel px-8 sm:px-14 py-16 relative overflow-hidden">
        <div className="cta-dots" />
        <Reveal>
          <div className="relative max-w-2xl">
            <span className="badge-pill mb-6" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.16)", color: "#B9D9C6" }}>
              <Sparkles size={12} /> LET'S TALK
            </span>
            <h2 className="font-serif text-[32px] sm:text-[40px] font-semibold text-white tracking-tight leading-tight mb-4">
              Let's build your raabta.
            </h2>
            <p className="text-[15px] text-[#B9D9C6] leading-relaxed mb-8 max-w-lg">
              Tell us where your customers are falling through the cracks. We'll tell you
              exactly what we'd build to fix it — no obligation.
            </p>
            <a
              href="mailto:ammadwork123@gmail.com"
              className="cta-btn inline-flex items-center gap-2 bg-white hover:bg-[#F2FBF5] text-[#06331F] text-[14px] font-semibold px-6 py-3.5 rounded-xl"
            >
              Book a free call <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#FBFDFC] border-t border-[#E9F5EE]">
        <div className="max-w-6xl mx-auto px-6 lg:pl-24 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
            <div className="md:col-span-5">
              <span className="font-serif text-[20px] font-semibold text-[#0B1F17] tracking-tight">
                Raabta
              </span>
              <p className="text-[13.5px] text-[#5B6B63] leading-relaxed mt-3 max-w-xs">
                A studio building web, mobile, and AI automation for businesses
                that want to connect with more customers, automatically.
              </p>
            </div>

            <div className="md:col-span-3">
              <p className="font-mono text-[11px] text-[#8B978F] font-medium tracking-wider mb-4">
                EXPLORE
              </p>
              <div className="flex flex-col gap-3">
                <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">
                  Services
                </a>
                <a href="#whatsapp" onClick={(e) => scrollToAnchor(e, "#whatsapp")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">
                  WhatsApp Automation
                </a>
                <a href="#process" onClick={(e) => scrollToAnchor(e, "#process")} className="text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit">
                  Process
                </a>
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="font-mono text-[11px] text-[#8B978F] font-medium tracking-wider mb-4">
                GET IN TOUCH
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:ammadwork123@gmail.com"
                  className="flex items-center gap-2.5 text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit"
                >
                  <Mail size={15} strokeWidth={1.75} />
                  ammadwork123@gmail.com
                </a>
                <a
                  href="tel:+923133125027"
                  className="flex items-center gap-2.5 text-[13.5px] text-[#3F4B45] hover:text-[#16A34A] transition-colors w-fit"
                >
                  <Phone size={15} strokeWidth={1.75} />
                  0313 3125027
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E9F5EE] flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-[#8B978F] font-mono">
              © 2026 Raabta — connecting businesses to their customers.
            </p>
            <a
              href="#top"
              onClick={(e) => scrollToAnchor(e, "#top")}
              className="flex items-center gap-1.5 text-[12px] font-mono text-[#5B6B63] hover:text-[#16A34A] transition-colors"
            >
              Back to top <ArrowUp size={13} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}