import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Printer, RotateCcw, User, Phone, MessageCircle, MapPin, CalendarDays, Users, Building2, Wallet, CreditCard, PiggyBank } from "lucide-react";
import receiptService from "../services/receipt.service";
import toast from "react-hot-toast";


const defaultForm = {
  rNo: "",
  date: "",
  clientName: "",
  resident: "",
  whatsapp: "",
  phone: "",
  reservedFor: "",
  day: "",
  functionName: "",
  noOfGuests: "",
  lumpSum: "",
  advance: "",
  balance: "",
};

const HALLS = ["Hall A", "Hall B", "Hall A & B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FUNCS = ["Wedding", "Valima", "Mehndi", "Barat", "Engagement", "Birthday", "Corporate"];

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
        {Icon && <Icon size={11} />} {label}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 placeholder-zinc-400";
const sel = "w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 appearance-none cursor-pointer";

function ReceiptPreview({ data }) {

  const balance = (() => {
    const l = parseFloat(String(data.lumpSum).replace(/,/g, "")) || 0;
    const a = parseFloat(String(data.advance).replace(/,/g, "")) || 0;
    return l && a ? (l - a).toLocaleString() : data.balance || "";
  })();

  const FanLogo = () => (
    <svg width="64" height="48" viewBox="0 0 72 52" className="mx-auto mb-1">
      <g transform="translate(36,46)">
        {[[-72, "#c0392b"], [-48, "#c0392b"], [-24, "#c0392b"], [0, "#9e9e9e"], [24, "#1a237e"], [48, "#1a237e"], [72, "#1a237e"]].map(([r, c]) => (
          <ellipse key={r} transform={`rotate(${r})`} rx="5" ry="22" fill={c} />
        ))}
      </g>
    </svg>
  );

  const Row = ({ label, value, line = true }) => (
    <div className="flex items-end gap-2 mb-2">
      <span className="text-[12px] font-bold whitespace-nowrap">{label}</span>
      <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
        {value && <span className="text-[12px] pl-1">{value}</span>}
      </div>
    </div>
  );

  return (
    <div className="border-2 border-blue-900 p-4 sm:p-5 bg-white font-sans text-gray-900 relative overflow-hidden w-full max-w-[420px] mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Watermark */}
      <svg className="absolute opacity-[0.06] pointer-events-none" style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }} width="260" height="260" viewBox="0 0 260 260">
        <g transform="translate(130,130)">
          {[-90, -60, -30, 0, 30, 60, 90].map((r, i) => (
            <ellipse key={r} transform={`rotate(${r})`} rx="17" ry="68" fill={["#c0392b", "#1a237e", "#e8c9b8", "#1a237e", "#c0392b", "#e8c9b8", "#1a237e"][i]} />
          ))}
        </g>
      </svg>

      <FanLogo />
      <div className="text-center mb-2">
        <div className="text-xl sm:text-2xl font-black text-red-700 tracking-wide leading-tight">DARBAR BANQUET</div>
      </div>

      <div className="flex flex-wrap justify-between items-end gap-x-2 gap-y-1 mb-3">
        <div className="text-[12px] font-bold">
          R.No. <span className="border-b border-blue-900 inline-block min-w-[60px] px-1 text-sm font-black text-center">{data.rNo}</span>
        </div>
      </div>

      <Row label="Date :" value={data.date} />
      <Row label="RECEIVED with thanks from Mr." value={data.clientName} />
      <Row label="Resident of" value={data.resident} />

      <div className="flex items-end gap-2 mb-2">
        <span className="text-[12px] font-bold whitespace-nowrap">WhatsApp.</span>
        <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.whatsapp && <span className="text-[12px] pl-1">{data.whatsapp}</span>}
        </div>
        <span className="text-[12px] font-bold whitespace-nowrap">Phone.</span>
        <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.phone && <span className="text-[12px] pl-1">{data.phone}</span>}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-[12px] font-bold whitespace-nowrap">has been reserved for</span>
        <div className="flex-[2] border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.reservedFor && <span className="text-[12px] pl-1">{data.reservedFor}</span>}
        </div>
        <span className="text-[12px] font-bold whitespace-nowrap">Day</span>
        <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.day && <span className="text-[12px] pl-1">{data.day}</span>}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-[12px] font-bold whitespace-nowrap">Function</span>
        <div className="flex-[2] border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.functionName && <span className="text-[12px] pl-1">{data.functionName}</span>}
        </div>
        <span className="text-[12px] font-bold whitespace-nowrap">No. Of Guest</span>
        <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.noOfGuest && <span className="text-[12px] pl-1">{data.noOfGuest}</span>}
        </div>
      </div>

      {/* Lump Sum */}
      <div className="flex items-end gap-2 mb-1">
        <span className="text-[12px] font-bold whitespace-nowrap">Lump Sum</span>
        <div className="flex-1 border-b border-blue-900 text-center" style={{ minHeight: 17 }}>
          {data.lumpSum && <span className="text-[12px] pl-1">Rs. {data.lumpSum}</span>}
        </div>
      </div>

      {/* Manager signature — line first, label below it */}
      <div className="flex flex-col items-end mb-2">
  {/* Added relative positioning and a negative bottom margin to push the image down onto the line */}
  <img className="w-28 relative -mb-4 z-10" src="/manager-signature.png" alt="Manager Signature" />
  
  <div className="border-b border-blue-900" style={{ width: 120, minHeight: 17 }}></div>
  <span className="text-[12px] font-bold whitespace-nowrap mt-1">Manager</span>
</div>

      <Row label="Advance" value={data.advance ? `Rs. ${data.advance}` : ""} />
      <Row label="Balance" value={balance ? `Rs. ${balance}` : ""} />

      {/* Terms */}
      <div className="text-center my-2">
        <span className="bg-red-700 text-white text-[12px] font-bold px-5 py-1 rounded-full">Terms &amp; Conditions</span>
      </div>
      <ul className="text-[10px] space-y-1 leading-snug">
        {["Advance non refundable. Balance must be paid within 48 hours prior your event.",
          "Cold drinks are strictly not allowed from outside. All drinks are available at company price @ Rs.1500 per crate chilled on counter.",
          "Fresh flower stage is not included in your booking amount.",
          "Premises should be vacated before 12 a.m.",
          "No musical function is allowed without concerned authorities permission.",
          "Car parking at your own risk.",
          "Management will not be responsible for loss of any kind of property."
        ].map((t, i) => (
          <li key={i} className="flex gap-1.5"><span className="text-red-700 text-[12px] leading-none mt-0.5">●</span><span>{t}</span></li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-2 mt-2">
        <span className="text-[10px]">I have read &amp; agreed to the above terms &amp; conditions.</span>
      </div>
      <div className="border-t-2 border-red-700 mt-2 mb-1.5"></div>
      <div className="text-center text-[11px] font-bold leading-snug">
        D-16, Block "N" Near Sakhi Hassan,<br />North Nazimabad, Karachi.
      </div>
    </div>
  );
}

const formatWhatsAppNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, "")

  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.slice(1)
  }

  return `whatsapp:+${cleaned}`
}

export default function DarbarReceiptForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: defaultForm,
  });


  const printRef = useRef();
  const formData = watch();

  const autoBalance = () => {
    const l = parseFloat(String(formData.lumpSum).replace(/,/g, "")) || 0;
    const a = parseFloat(String(formData.advance).replace(/,/g, "")) || 0;
    if (l && a) setValue("balance", (l - a).toLocaleString());
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log("Receipt data:", data);
      const fixedData = {
        rNo: data.rNo,
        date: data.date,
        clientName: data.clientName,
        resident: data.resident,
        whatsapp: data.whatsapp,
        phone: data.phone,
        reservedFor: data.reservedFor,
        day: data.day,
        functionName: data.functionName,
        noOfGuests: data.noOfGuest,
        lumpSum: data.lumpSum,
        advance: data.advance,
        balance: data.balance
      }

      const formattedData = {
        ...fixedData,
        whatsapp: formatWhatsAppNumber(fixedData.whatsapp)
      }

      const result = await receiptService.sendReceipt(formattedData)

      if (result?.success === true) {
        toast.success("Receipt Sent!")
      }

    } catch (error) {
      console.log("An Error Occured: ", error)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-5 sm:mb-7">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Darbar Banquet</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1" style={{ fontFamily: "Georgia, serif" }}>Receipt Generator</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Fill in the details — receipt updates live{" "}
            <span className="lg:hidden">below</span>
            <span className="hidden lg:inline">on the right</span>
          </p>
        </div>

        {/* Mobile-only toggle to jump to preview */}
        <button
          type="button"
          onClick={() => setShowPreviewMobile(v => !v)}
          className="lg:hidden mb-4 w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          {showPreviewMobile ? "Show Form" : "Show Receipt Preview"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`space-y-5 ${showPreviewMobile ? "hidden lg:block" : ""}`}
          >

            {/* Receipt No */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Receipt Info</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="R. No.">
                  <input className={inp} placeholder="730" {...register("rNo")} />
                </Field>
                <Field label="Date" icon={CalendarDays}>
                  <input type="date" className={inp} {...register("date")} />
                </Field>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Client Information</p>
              <div className="space-y-4">
                <Field label="Client Name" icon={User}>
                  <input className={inp} placeholder="Mr. Ali Ahmed" {...register("clientName")} />
                </Field>
                <Field label="Resident of" icon={MapPin}>
                  <input className={inp} placeholder="North Nazimabad, Karachi" {...register("resident")} />
                </Field>
                <Field label="WhatsApp Number" icon={MessageCircle}>
                  <input className={inp} placeholder="0300-1234567" {...register("whatsapp")} />
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <input className={inp} placeholder="021-1234567" {...register("phone")} />
                </Field>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Event Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Reserved For" icon={Building2}>
                  <select className={sel} {...register("reservedFor")}>
                    <option value="">Select Hall</option>
                    {HALLS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </Field>
                <Field label="Day">
                  <select className={sel} {...register("day")}>
                    <option value="">Select Day</option>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Function" icon={CalendarDays}>
                  <select className={sel} {...register("functionName")}>
                    <option value="">Select Function</option>
                    {FUNCS.map(fn => <option key={fn}>{fn}</option>)}
                  </select>
                </Field>
                <Field label="No. of Guests" icon={Users}>
                  <input type="number" className={inp} placeholder="350" {...register("noOfGuest")} />
                </Field>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Payment Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Lump Sum (Rs.)" icon={Wallet}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="850000"
                    {...register("lumpSum")}
                    onBlur={autoBalance}
                  />
                </Field>
                <Field label="Advance (Rs.)" icon={CreditCard}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="300000"
                    {...register("advance")}
                    onBlur={autoBalance}
                  />
                </Field>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Balance (Rs.)" icon={PiggyBank}>
                    <div className="relative">
                      <input
                        type="text"
                        className={inp + " bg-zinc-100 font-semibold"}
                        placeholder="Auto-calculated"
                        {...register("balance")}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-medium">auto</span>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Live payment bar */}
              {formData.lumpSum && (
                <div className="mt-4 bg-zinc-50 rounded-xl p-3 border border-zinc-200">
                  {(() => {
                    const l = parseFloat(formData.lumpSum) || 0;
                    const a = parseFloat(formData.advance) || 0;
                    const pct = l ? Math.min(100, Math.round((a / l) * 100)) : 0;
                    return (
                      <>
                        <div className="flex flex-wrap justify-between gap-1 text-[11px] font-semibold text-zinc-600 mb-1.5">
                          <span>Advance: Rs. {(a).toLocaleString()}</span>
                          <span>{pct}% paid</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[11px] text-red-500 font-medium mt-1">
                          Balance: Rs. {Math.max(0, l - a).toLocaleString()}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-600 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer bg-transparent order-2 sm:order-1"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl shadow-md shadow-zinc-200 transition-all duration-200 cursor-pointer border-none disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none order-1 sm:order-2"
              >
                <Printer size={15} />
                {isSubmitting ? "Sending..." : "Send Receipt"}
              </button>
            </div>
          </form>

          {/* ── LIVE PREVIEW ── */}
          <div className={`lg:sticky lg:top-6 self-start ${showPreviewMobile ? "" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Preview</p>
              <span className="text-[10px] bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full font-semibold">Updates as you type</span>
            </div>
            <div ref={printRef} className="shadow-xl shadow-zinc-200 rounded-xl overflow-hidden overflow-x-auto">
              <ReceiptPreview data={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}