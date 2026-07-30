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
// Desktop only; respects prefers-reduced-motion via CSS.
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
// Cards
// ─────────────────────────────────────────────────────────────────────────
function PillarCard({ icon: Icon, title, desc, index }) {
  return (
    <Reveal delay={index * 80} className="h-full">
      <div className="pillar-card group h-full">
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

function OfferChip({ icon: Icon, title, desc, index }) {
  return (
    <Reveal delay={index * 60}>
      <div className="offer-chip group">
        <div className="w-9 h-9 rounded-lg bg-[#F2FBF5] flex items-center justify-center text-[#16A34A] mb-3 group-hover:bg-[#16A34A] group-hover:text-white transition-colors duration-300">
          <Icon size={17} strokeWidth={2} />
        </div>
        <h4 className="font-sans text-[13.5px] font-semibold text-[#0B1F17] mb-1 tracking-tight">
          {title}
        </h4>
        <p className="text-[12px] text-[#5B6B63] leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  );
}

function ProcessStep({ num, title, desc, isLast }) {
  return (
    <Reveal delay={parseInt(num) * 80} className="flex-1">
      <div className="relative pl-0">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-mono text-[12px] text-[#16A34A] font-semibold tracking-wider">
            {num}
          </span>
          <div className="h-px flex-1 bg-[#DCEFE3]" />
        </div>
        <h3 className="font-serif text-[20px] font-semibold text-[#0B1F17] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[13.5px] text-[#5B6B63] leading-relaxed pr-4">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis smooth scrolling
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

    // Update scroll progress through Lenis event listener
    lenis.on("scroll", (e) => {
      setScrollProgress(e.progress);
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

  // Helper for smooth anchor link scrolling using Lenis
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

  const pillars = [
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
    { icon: Receipt, title: "Digital Receipts", desc: "Itemized invoices sent straight to WhatsApp." },
    { icon: PhoneCall, title: "Outreach & Follow-ups", desc: "Re-engage past customers with timely offers." },
    { icon: Bell, title: "Status Updates", desc: "Keep customers informed at every step." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        /* Lenis Recommended Essential CSS */
        html.lenis, html.lenis body {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }

        .font-serif { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }

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
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, #16A34A, #0B7A38);
          border-radius: 2px;
          transition: height 120ms linear;
        }
        .raabta-node {
          position: absolute;
          left: 50%;
          width: 8px;
          height: 8px;
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

        .pillar-card {
          background: #FFFFFF;
          border: 1px solid #E3F1E9;
          border-radius: 20px;
          padding: 28px;
          transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
        }
        .pillar-card:hover {
          border-color: #16A34A;
          box-shadow: 0 16px 40px -20px rgba(11,31,23,0.25);
          transform: translateY(-4px);
        }
        .pillar-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #F2FBF5;
          color: #16A34A;
          display: flex; align-items: center; justify-content: center;
        }

        .offer-chip {
          background: #FBFDFC;
          border: 1px solid #E9F5EE;
          border-radius: 16px;
          padding: 20px;
          transition: border-color 250ms ease, transform 250ms ease;
        }
        .offer-chip:hover {
          border-color: #16A34A;
          transform: translateY(-2px);
        }

        .cta-btn {
          transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
        }
        .cta-btn:hover { transform: translateY(-1px); }
        .cta-btn:active { transform: translateY(0px) scale(0.98); }

        @media (prefers-reduced-motion: reduce) {
          .drift-blob, .raabta-node-lit { animation: none !important; }
          * { transition-duration: 0.01ms !important; }
        }

        @media (max-width: 1023px) {
          .raabta-rail { display: none; }
        }
      `}</style>

      <RaabtaLine progress={scrollProgress} />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#E9F5EE]">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <a href="#top" onClick={(e) => scrollToAnchor(e, "#top")} className="flex items-center gap-2">
            <span className="font-serif text-[20px] font-semibold text-[#0B1F17] tracking-tight">
              Raabta
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#services" onClick={(e) => scrollToAnchor(e, "#services")} className="text-[13.5px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              Services
            </a>
            <a href="#whatsapp" onClick={(e) => scrollToAnchor(e, "#whatsapp")} className="text-[13.5px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              WhatsApp Automation
            </a>
            <a href="#process" onClick={(e) => scrollToAnchor(e, "#process")} className="text-[13.5px] font-medium text-[#3F4B45] hover:text-[#16A34A] transition-colors">
              Process
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-[13px] font-medium text-[#5B6B63] hover:text-[#16A34A] transition-colors">
              Login
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollToAnchor(e, "#contact")}
              className="cta-btn bg-[#0B1F17] hover:bg-[#16A34A] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl"
            >
              Book a call
            </a>
          </div>

          <button
            className="md:hidden text-[#0B1F17]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#E9F5EE] bg-white px-6 py-4 flex flex-col gap-4">
            <a href="#services" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#services"); }} className="text-[14px] font-medium text-[#3F4B45]">Services</a>
            <a href="#whatsapp" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#whatsapp"); }} className="text-[14px] font-medium text-[#3F4B45]">WhatsApp Automation</a>
            <a href="#process" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#process"); }} className="text-[14px] font-medium text-[#3F4B45]">Process</a>
            <a href="/login" className="text-[14px] font-medium text-[#5B6B63]">Login</a>
            <a href="#contact" onClick={(e) => { setMenuOpen(false); scrollToAnchor(e, "#contact"); }} className="cta-btn bg-[#0B1F17] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl text-center">
              Book a call
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="top" className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 lg:pl-24 overflow-hidden">
        <div
          className="drift-blob absolute -top-20 right-0 w-[420px] h-[420px] rounded-full opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #DCF5E4 0%, transparent 70%)" }}
        />

        <Reveal delay={100}>
          <h1 className="font-serif text-[42px] sm:text-[54px] lg:text-[68px] font-semibold text-[#0B1F17] leading-[1.05] tracking-tight max-w-3xl mb-6">
            Raabta means connection.
            <br />
            <span className="text-[#16A34A]">We build the ones</span> that grow your business.
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-[16px] text-[#5B6B63] leading-relaxed max-w-xl mb-10">
            A studio that builds the full stack behind modern growth — websites, mobile apps,
            AI automation, and lead systems — so your business connects with customers at
            every touchpoint, automatically.
          </p>
        </Reveal>

        <Reveal delay={300}>
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
      </section>

      {/* ── Service Pillars ── */}
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
          {pillars.map((p, i) => (
            <PillarCard key={p.title} {...p} index={i} />
          ))}
        </div>
      </section>

      {/* ── WhatsApp Automation deep-dive ── */}
      <section id="whatsapp" className="bg-[#F7FCF9] border-y border-[#E9F5EE] py-24">
        <div className="max-w-6xl mx-auto px-6 lg:pl-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div className="max-w-lg">
                <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">
                  FLAGSHIP CAPABILITY
                </p>
                <h2 className="font-serif text-[28px] sm:text-[32px] font-semibold text-[#0B1F17] tracking-tight leading-tight">
                  WhatsApp automation, built around your business
                </h2>
              </div>
              <p className="text-[13.5px] text-[#5B6B63] max-w-xs">
                A custom chatbot that runs your bookings, receipts, and follow-ups —
                where your customers already are.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((o, i) => (
              <OfferChip key={o.title} {...o} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className="max-w-6xl mx-auto px-6 py-24 lg:pl-24">
        <Reveal>
          <p className="font-mono text-[11.5px] text-[#16A34A] font-medium tracking-wider mb-3">
            HOW WE WORK
          </p>
          <h2 className="font-serif text-[30px] sm:text-[36px] font-semibold text-[#0B1F17] tracking-tight leading-tight mb-14 max-w-xl">
            Four steps from idea to a system that runs itself
          </h2>
        </Reveal>

        <div className="flex flex-col md:flex-row gap-10 md:gap-6">
          <ProcessStep num="01" title="Discover" desc="We map your workflow and find where automation and better software actually move the needle." />
          <ProcessStep num="02" title="Build" desc="Design and development happen in tandem, with working versions in your hands early and often." />
          <ProcessStep num="03" title="Launch" desc="We ship, connect it to your real data, and make sure it holds up under real customer traffic." />
          <ProcessStep num="04" title="Grow" desc="We keep tuning the system as your business changes — it's a partnership, not a handoff." isLast />
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section id="contact" className="mx-6 lg:mx-24 mb-6 rounded-[28px] bg-[#06331F] px-8 sm:px-14 py-16 relative overflow-hidden">
        <div
          className="drift-blob absolute -bottom-24 -left-16 w-[360px] h-[360px] rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #16A34A 0%, transparent 70%)" }}
        />
        <Reveal>
          <div className="relative max-w-2xl">
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
            {/* Brand */}
            <div className="md:col-span-5">
              <span className="font-serif text-[20px] font-semibold text-[#0B1F17] tracking-tight">
                Raabta
              </span>
              <p className="text-[13.5px] text-[#5B6B63] leading-relaxed mt-3 max-w-xs">
                A studio building web, mobile, and AI automation for businesses
                that want to connect with more customers, automatically.
              </p>
            </div>

            {/* Explore */}
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

            {/* Contact */}
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

          {/* Bottom bar */}
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