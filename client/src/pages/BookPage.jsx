import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";

const STREAK_IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_3HrL189N3SZfcJ1cBXy3Vk0GNFp/hf_20260818_113527_290afeae-e608-4795-ad9d-c645c6f1e321.png";

const EMAILJS_SERVICE_ID = "service_1wzmpgd";
const EMAILJS_TEMPLATE_ID = "template_7hnmvvo";
const EMAILJS_PUBLIC_KEY = "EVbS9KSmsty-XE4Sp";

export default function BookPage() {
  const formRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      formRef.current.reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Something went wrong. Please email us directly or try again.");
    }
  };

  return (
    <div className="book-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        .book-page {
          position: relative;
          min-height: 100vh;
          background: #FAFBFA;
          color: #111;
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .bg-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes drift { 0% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } 50% { transform: scale(1.3) translate(2%, 2%) rotate(1deg); } 100% { transform: scale(1.15) translate(-2%, -1%) rotate(0deg); } }
        .drift-bg { animation: drift 14s ease-in-out infinite; }

        @keyframes sweep { 0% { transform: translateX(-40%) skewX(-12deg); opacity: 0; } 10% { opacity: 0.5; } 50% { opacity: 0.5; } 90% { opacity: 0; } 100% { transform: translateX(140%) skewX(-12deg); opacity: 0; } }
        .sweep { animation: sweep 6s ease-in-out infinite; }

        .content-wrapper {
          position: relative;
          z-index: 1;
        }

        .font-display { font-family: 'Instrument Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        .book-nav {
          max-width: 640px; margin: 0 auto; padding: 24px 20px 0;
        }
        .back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: #5A6B62;
          text-decoration: none; transition: color 0.15s;
        }
        .back:hover { color: #111; }

        .book-main {
          max-width: 640px; margin: 0 auto; padding: 40px 20px 80px;
        }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #2D6A4F;
        }
        .heading {
          font-family: 'Instrument Sans', system-ui, sans-serif;
          font-size: clamp(28px, 5vw, 36px);
          font-weight: 650; letter-spacing: -0.03em;
          line-height: 1.15; color: #111;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 28px 24px;
          margin-top: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .field { margin-bottom: 18px; }
        .field label {
          display: block; font-size: 13px; font-weight: 500;
          color: #3D4A43; margin-bottom: 6px;
        }
        .field input,
        .field select,
        .field textarea {
          width: 100%;
          font-family: inherit; font-size: 14px;
          padding: 11px 13px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          background: #FAFBFA;
          color: #111;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #2D6A4F;
          box-shadow: 0 0 0 3px rgba(45,106,79,0.12);
          background: #fff;
        }
        .field textarea { min-height: 110px; resize: vertical; }
        .field select {
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6B62' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
        }

        .row { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 520px) {
          .row { grid-template-columns: 1fr 1fr; gap: 14px; }
        }

        .submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; margin-top: 8px;
          background: #111; color: #fff;
          font-size: 14px; font-weight: 600;
          padding: 14px; border-radius: 10px; border: none;
          cursor: pointer; transition: background 0.15s, transform 0.15s;
        }
        .submit:hover:not(:disabled) { background: #222; transform: translateY(-1px); }
        .submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .success-box { text-align: center; padding: 48px 24px; }
        .success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: #EEF5F0; color: #2D6A4F;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .error-text {
          font-size: 13px; color: #B91C1C; margin-top: 12px; text-align: center;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="bg-container">
        <img src={STREAK_IMG} alt="" className="drift-bg h-full w-full object-cover" />
        <div className="sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
      </div>

      <div className="content-wrapper">
        <div className="book-nav">
          <a href="/" className="back">
            <ArrowLeft size={14} /> Back to home
          </a>
        </div>

        <main className="book-main">
         
          <h1 className="heading mb-3">Tell us a bit about the project</h1>
          <p className="text-[15px] text-[#5A6B62] leading-relaxed max-w-md">
            We'll reply within one business day with next steps or a suggested call time.
          </p>

          {status === "success" ? (
            <div className="form-card success-box">
              <div className="success-icon">
                <Check size={22} strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-[22px] font-semibold mb-2">Request received</h2>
              <p className="text-[14px] text-[#5A6B62] leading-relaxed max-w-sm mx-auto">
                Thanks ~ we'll get back to you shortly at the email you provided.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 mt-8 text-[13px] font-semibold text-[#111] hover:underline"
              >
                <ArrowLeft size={14} /> Back to home
              </a>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="form-card">
              <div className="row">
                <div className="field">
                  <label htmlFor="from_name">Name *</label>
                  <input id="from_name" name="from_name" type="text" required placeholder="Your name" />
                </div>
                <div className="field">
                  <label htmlFor="from_email">Email *</label>
                  <input id="from_email" name="from_email" type="email" required placeholder="you@company.com" />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" placeholder="+92 300 0000000" />
                </div>
                <div className="field">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" placeholder="Company name" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="message">What do you need help with? *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="e.g. WhatsApp booking bot for our venue, mobile app MVP, full website redesign…"
                />
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="budget">Budget range</label>
                  <select id="budget" name="budget" defaultValue="">
                    <option value="" disabled>Select range</option>
                    <option value="Under $1,500">Under $1,500</option>
                    <option value="$1,500 – $3,500">$1,500 – $3,500</option>
                    <option value="$3,500 – $8,000">$3,500 – $8,000</option>
                    <option value="$8,000+">$8,000+</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="timeline">Timeline</label>
                  <select id="timeline" name="timeline" defaultValue="">
                    <option value="" disabled>Select timeline</option>
                    <option value="ASAP">ASAP</option>
                    <option value="2–4 weeks">2–4 weeks</option>
                    <option value="1–2 months">1–2 months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="submit" disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send request <ArrowRight size={15} />
                  </>
                )}
              </button>

              {status === "error" && <p className="error-text">{errorMsg}</p>}
            </form>
          )}
        </main>
      </div>
    </div>
  );
}