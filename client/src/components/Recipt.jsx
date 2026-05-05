import { useState, useRef } from "react";
import { Printer, RotateCcw, User, Phone, MapPin, CalendarDays, Users, Building2, Wallet, CreditCard, PiggyBank } from "lucide-react";

const defaultForm = {
  rNo: "",
  date: "",
  clientName: "",
  resident: "",
  telephone: "",
  reservedFor: "",
  day: "",
  function: "",
  noOfGuest: "",
  lumpSum: "",
  advance: "",
  balance: "",
};

const HALLS   = ["Hall A", "Hall B", "Hall A & B"];
const DAYS    = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const FUNCS   = ["Wedding","Walima","Mehndi","Barat","Engagement","Birthday","Corporate"];

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-green-600 uppercase tracking-widest mb-1.5">
        {Icon && <Icon size={11} />} {label}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full border border-green-200 rounded-xl px-3.5 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-green-300";
const sel = "w-full border border-green-200 rounded-xl px-3.5 py-2.5 text-sm text-green-900 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none cursor-pointer";

function ReceiptPreview({ data }) {
  const balance = (() => {
    const l = parseFloat(String(data.lumpSum).replace(/,/g, "")) || 0;
    const a = parseFloat(String(data.advance).replace(/,/g, "")) || 0;
    return l && a ? (l - a).toLocaleString() : data.balance || "";
  })();

  const FanLogo = () => (
    <svg width="64" height="48" viewBox="0 0 72 52" className="mx-auto mb-1">
      <g transform="translate(36,46)">
        {[[-72,"#c0392b"],[-48,"#c0392b"],[-24,"#c0392b"],[0,"#9e9e9e"],[24,"#1a237e"],[48,"#1a237e"],[72,"#1a237e"]].map(([r,c])=>(
          <ellipse key={r} transform={`rotate(${r})`} rx="5" ry="22" fill={c}/>
        ))}
      </g>
    </svg>
  );

  const Row = ({ label, value, line = true }) => (
    <div className="flex items-end gap-2 mb-2">
      <span className="text-[11px] font-bold whitespace-nowrap">{label}</span>
      <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}>
        {value && <span className="text-[11px] pl-1">{value}</span>}
      </div>
    </div>
  );

  return (
    <div className="border-2 border-blue-900 p-5 bg-white font-sans text-gray-900 relative overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Watermark */}
      <svg className="absolute opacity-[0.06] pointer-events-none" style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }} width="260" height="260" viewBox="0 0 260 260">
        <g transform="translate(130,130)">
          {[-90,-60,-30,0,30,60,90].map((r,i)=>(
            <ellipse key={r} transform={`rotate(${r})`} rx="17" ry="68" fill={["#c0392b","#1a237e","#e8c9b8","#1a237e","#c0392b","#e8c9b8","#1a237e"][i]}/>
          ))}
        </g>
      </svg>

      <FanLogo />
      <div className="text-center mb-2">
        <div className="text-2xl font-black text-red-700 tracking-wide leading-tight">DARBAR BANQUET</div>
        <div className="text-base font-bold text-blue-900 tracking-[4px]">A &amp; B</div>
      </div>

      <div className="flex justify-between items-end mb-3">
        <div className="text-[11px] font-bold">
          R.No. <span className="border-b border-blue-900 inline-block min-w-[60px] px-1 text-sm font-black">{data.rNo}</span>
        </div>
        <div className="text-[10px] font-bold text-red-700">Tel:021-36641326, 021-36641327</div>
      </div>

      <Row label="Date :" value={data.date} />
      <Row label="RECEIVED with thanks from Mr." value={data.clientName} />
      <Row label="Resident of" value={data.resident} />

      <div className="flex items-end gap-2 mb-2">
        <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}></div>
        <span className="text-[11px] font-bold whitespace-nowrap">Telephone#.</span>
        <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.telephone && <span className="text-[11px] pl-1">{data.telephone}</span>}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-[11px] font-bold whitespace-nowrap">has been reserved for</span>
        <div className="flex-[2] border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.reservedFor && <span className="text-[11px] pl-1">{data.reservedFor}</span>}
        </div>
        <span className="text-[11px] font-bold whitespace-nowrap">Day</span>
        <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.day && <span className="text-[11px] pl-1">{data.day}</span>}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-[11px] font-bold whitespace-nowrap">Function</span>
        <div className="flex-[2] border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.function && <span className="text-[11px] pl-1">{data.function}</span>}
        </div>
        <span className="text-[11px] font-bold whitespace-nowrap">No. Of Guest</span>
        <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.noOfGuest && <span className="text-[11px] pl-1">{data.noOfGuest}</span>}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-1">
        <span className="text-[11px] font-bold whitespace-nowrap">Lump Sum</span>
        <div className="flex-1 border-b border-blue-900" style={{ minHeight: 16 }}>
          {data.lumpSum && <span className="text-[11px] pl-1">Rs. {data.lumpSum}</span>}
        </div>
        <span className="text-[11px] font-bold whitespace-nowrap">Manager</span>
      </div>
      <div className="flex justify-end mb-2">
        <div className="border-b border-blue-900" style={{ width: 120, minHeight: 16 }}></div>
      </div>

      <Row label="Advance" value={data.advance ? `Rs. ${data.advance}` : ""} />
      <Row label="Balance" value={balance ? `Rs. ${balance}` : ""} />

      {/* Terms */}
      <div className="text-center my-2">
        <span className="bg-red-700 text-white text-[11px] font-bold px-5 py-1 rounded-full">Terms &amp; Conditions</span>
      </div>
      <ul className="text-[9.5px] space-y-1 leading-snug">
        {["Advance non refundable. Balance must be paid within 48 hours prior your event.",
          "Cold drinks are strictly not allowed from outside. All drinks are available at company price @ Rs.1200 per crate chilled on counter.",
          "Fresh flower stage is not included in your booking amount.",
          "Premises should be vacated before 12 a.m.",
          "No musical function is allowed without concerned authorities permission.",
          "Car parking at your own risk.",
          "Management will not be responsible for loss of any kind of property."
        ].map((t, i) => (
          <li key={i} className="flex gap-1.5"><span className="text-red-700 text-[11px] leading-none mt-0.5">●</span><span>{t}</span></li>
        ))}
      </ul>

      <div className="flex justify-between items-end mt-2">
        <span className="text-[9px]">I have read &amp; agreed to the above terms &amp; conditions.</span>
        <div className="text-right">
          <div className="text-[10px] font-bold text-red-700">Signature of Party</div>
          <div className="border-b border-red-700 mt-0.5" style={{ width: 100 }}></div>
        </div>
      </div>
      <div className="border-t-2 border-red-700 mt-2 mb-1.5"></div>
      <div className="text-center text-[10px] font-bold leading-snug">
        D-16, Block "N" Near Sakhi Hassan,<br/>North Nazimabad, Karachi.
      </div>
    </div>
  );
}

export default function DarbarReceiptForm() {
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(false);
  const printRef = useRef();

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const autoBalance = () => {
    const l = parseFloat(String(form.lumpSum).replace(/,/g, "")) || 0;
    const a = parseFloat(String(form.advance).replace(/,/g, "")) || 0;
    if (l && a) f("balance", (l - a).toLocaleString());
  };

  

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-7">
          <span className="text-xs font-semibold text-green-500 uppercase tracking-widest">Darbar Banquet A &amp; B</span>
          <h1 className="text-3xl font-bold text-green-900 mt-1" style={{ fontFamily: "Georgia, serif" }}>Receipt Generator</h1>
          <p className="text-green-500 text-sm mt-1">Fill in the details — receipt updates live on the right</p>
        </div>

        <div className="grid grid-cols-2 gap-8">

          {/* ── FORM ── */}
          <div className="space-y-5">

            {/* Receipt No */}
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">Receipt Info</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="R. No.">
                  <input className={inp} placeholder="730" value={form.rNo} onChange={e => f("rNo", e.target.value)} />
                </Field>
                <Field label="Date" icon={CalendarDays}>
                  <input type="date" className={inp} value={form.date} onChange={e => f("date", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">Client Information</p>
              <div className="space-y-4">
                <Field label="Client Name" icon={User}>
                  <input className={inp} placeholder="Mr. Ali Ahmed" value={form.clientName} onChange={e => f("clientName", e.target.value)} />
                </Field>
                <Field label="Resident of" icon={MapPin}>
                  <input className={inp} placeholder="North Nazimabad, Karachi" value={form.resident} onChange={e => f("resident", e.target.value)} />
                </Field>
                <Field label="Telephone" icon={Phone}>
                  <input className={inp} placeholder="0300-1234567" value={form.telephone} onChange={e => f("telephone", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">Event Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Reserved For" icon={Building2}>
                  <select className={sel} value={form.reservedFor} onChange={e => f("reservedFor", e.target.value)}>
                    <option value="">Select Hall</option>
                    {HALLS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </Field>
                <Field label="Day">
                  <select className={sel} value={form.day} onChange={e => f("day", e.target.value)}>
                    <option value="">Select Day</option>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Function" icon={CalendarDays}>
                  <select className={sel} value={form.function} onChange={e => f("function", e.target.value)}>
                    <option value="">Select Function</option>
                    {FUNCS.map(fn => <option key={fn}>{fn}</option>)}
                  </select>
                </Field>
                <Field label="No. of Guests" icon={Users}>
                  <input type="number" className={inp} placeholder="350" value={form.noOfGuest} onChange={e => f("noOfGuest", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">Payment Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Lump Sum (Rs.)" icon={Wallet}>
                  <input type="number" className={inp} placeholder="850000" value={form.lumpSum}
                    onChange={e => f("lumpSum", e.target.value)}
                    onBlur={autoBalance} />
                </Field>
                <Field label="Advance (Rs.)" icon={CreditCard}>
                  <input type="number" className={inp} placeholder="300000" value={form.advance}
                    onChange={e => f("advance", e.target.value)}
                    onBlur={autoBalance} />
                </Field>
                <div className="col-span-2">
                  <Field label="Balance (Rs.)" icon={PiggyBank}>
                    <div className="relative">
                      <input type="text" className={inp + " bg-green-100 font-semibold"} placeholder="Auto-calculated"
                        value={form.balance} onChange={e => f("balance", e.target.value)} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-400 font-medium">auto</span>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Live payment bar */}
              {form.lumpSum && (
                <div className="mt-4 bg-green-50 rounded-xl p-3 border border-green-100">
                  {(() => {
                    const l = parseFloat(form.lumpSum) || 0;
                    const a = parseFloat(form.advance) || 0;
                    const pct = l ? Math.min(100, Math.round((a / l) * 100)) : 0;
                    return (
                      <>
                        <div className="flex justify-between text-[11px] font-semibold text-green-600 mb-1.5">
                          <span>Advance: Rs. {(a).toLocaleString()}</span>
                          <span>{pct}% paid</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[11px] text-red-400 font-medium mt-1">
                          Balance: Rs. {Math.max(0, l - a).toLocaleString()}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setForm(defaultForm)}
                className="flex items-center gap-2 border border-green-200 text-green-600 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-green-100 transition-colors cursor-pointer bg-transparent"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all duration-200 cursor-pointer border-none"
              >
                <Printer size={15} /> Send Recipt
              </button>
            </div>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="sticky top-6 self-start">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Preview</p>
              <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-semibold">Updates as you type</span>
            </div>
            <div ref={printRef} className="shadow-xl shadow-green-100 rounded-xl overflow-hidden">
              <ReceiptPreview data={form} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}