import React, { useRef, useState } from "react";
import { Star, ArrowUpRight } from "lucide-react";

export const REVIEWS = [
  {
    name: "Darbar Banquet",
    location: "Pakistan",
    tag: "Venue Automation",
    stars: 5,
    text: "Eliminated our manual workload completely by digitizing our booking system. The AI agent and Meta WhatsApp API integration save our team hours daily.",
    link: "https://wa.me/923008207221",
    linkLabel: "Try live WhatsApp bot",
  },
  {
    name: "Aaron",
    location: "United States",
    tag: "Product Build",
    stars: 5,
    text: "Highly professional, calm under pressure, and solution-focused. Execution was flawless throughout the build and delivered right on time.",
    link: null,
    linkLabel: "",
  },
  {
    name: "Teamstack",
    location: "Thailand",
    tag: "Web3 / Payments",
    stars: 5,
    text: "Matched our rapid engineering pace effortlessly on a tight deadline. Reliable team—we have already kicked off our second project together.",
    link: null,
    linkLabel: "",
  },
  {
    name: "Richard",
    location: "United States",
    tag: "Web Platform",
    stars: 5,
    text: "Clear updates, super fast delivery, and an end product that exceeded our expectations. Seamless integration from start to finish.",
    link: null,
    linkLabel: "",
  },
];

// Keyframes are injected once, globally, the first time a card mounts.
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-review-card-styles", "");
  style.textContent = `
    @keyframes reviewCardIn {
      from { opacity: 0; transform: translateY(18px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes reviewStarPop {
      0%   { opacity: 0; transform: scale(0.2) rotate(-20deg); }
      60%  { opacity: 1; transform: scale(1.15) rotate(4deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .review-card, .review-card * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `;
  document.head.appendChild(style);
}

export function ReviewCard({ r, index = 0 }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState(false);
  injectStyles();

  // Bound the stagger so long/duplicated marquee rows don't queue up a slow crawl of entrances.
  const stagger = index % REVIEWS.length;

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -6, ry: px * 8 });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0 });
    setHovered(false);
  }

  return (
    <div
      className="review-card opacity-0"
      style={{
        animation: "reviewCardIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        animationDelay: `${stagger * 90}ms`,
        perspective: "1000px",
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleLeave}
        className="group relative flex w-[340px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-shadow duration-500 ease-out will-change-transform hover:shadow-[0_28px_45px_-20px_rgba(5,150,105,0.18)]"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${hovered ? -6 : 0}px)`,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease",
        }}
      >
        {/* hairline glow ring, brightens on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-500/0 transition-all duration-500 group-hover:ring-emerald-500/25" />

        {/* diagonal sheen sweep */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-[130%] -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[130%]"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* ghost quotation mark signature */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 right-4 select-none font-display text-[100px] leading-none text-emerald-600/[0.06] transition-colors duration-500 group-hover:text-emerald-600/[0.1]"
        >
          &rdquo;
        </span>

        <div className="relative">
          {/* Star Rating — staggered pop-in on mount */}
          <div className="mb-3 flex items-center gap-1 text-amber-400">
            {[...Array(r.stars)].map((_, i) => (
              <Star
                key={i}
                size={15}
                fill="currentColor"
                stroke="none"
                className="opacity-0"
                style={{
                  animation: "reviewStarPop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards",
                  animationDelay: `${stagger * 90 + 300 + i * 70}ms`,
                }}
              />
            ))}
          </div>

          <p className="font-body text-[15px] leading-relaxed text-zinc-800">
            &ldquo;{r.text}&rdquo;
          </p>

          {r.link && (
            <a
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-600 transition-colors duration-200 hover:text-emerald-700"
            >
              {r.linkLabel}
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          )}
        </div>

        <div className="relative mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
          <div>
            <p className="font-display text-sm font-semibold text-zinc-900">{r.name}</p>
            <p className="font-mono text-xs text-zinc-500">{r.location}</p>
          </div>

          <span className="relative overflow-hidden rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-100">
            {r.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

// Standalone demo page — not used by the landing page, kept for isolated preview/testing.
export default function ReviewShowcase() {
  return (
    <div className="min-h-[520px] w-full bg-[#F6F5F2] px-8 py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600">
          Client Feedback
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-zinc-900">
          Trusted by teams shipping fast
        </h2>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [-ms-overflow-style:none]">
        {REVIEWS.map((r, i) => (
          <ReviewCard key={r.name} r={r} index={i} />
        ))}
      </div>
    </div>
  );
}