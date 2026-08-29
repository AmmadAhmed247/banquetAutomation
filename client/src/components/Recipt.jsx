import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Printer, RotateCcw, User, Phone, MessageCircle, MapPin, CalendarDays, Users, Building2, Wallet, CreditCard, PiggyBank } from "lucide-react";
import receiptService from "../services/receipt.service";
import bookingService from "../services/booking.service"; // Added booking service import
import toast from "react-hot-toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
};

const defaultForm = {
  rNo: "",
  date: new Date().toISOString().slice(0, 10),
  clientName: "",
  resident: "",
  whatsapp: "",
  phone: "",
  reservationDate: "",
  day: "",
  functionName: "",
  noOfGuests: "",
  lumpSum: "",
  advance: "",
  balance: "",
  venue: "Hall A", // Default option for matching booking venue field
  package: "",     // Optional field for package name
};

const isValidPhoneLength = (number) => {
  if (!number) return true; 
  const digits = number.replace(/\D/g, ""); 

  if (digits.startsWith("92")) {
    return digits.length === 12;
  }
  if (digits.startsWith("0")) {
    return digits.length === 11;
  }
  return false; 
};

const HALLS = ["Hall A", "Hall B", "Hall A & B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FUNCS = ["Wedding", "Valima", "Mehndi", "Barat", "Engagement", "Birthday", "Corporate" , "Barat and Valima" , "Nikah"];

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
    <svg width="38" height="38" viewBox="0 0 72 52" className="mx-auto mb-1">
      <g transform="translate(36,46)">
        {[[-72, "#c0392b"], [-48, "#c0392b"], [-24, "#c0392b"], [0, "#9e9e9e"], [24, "#1a237e"], [48, "#1a237e"], [72, "#1a237e"]].map(([r, c]) => (
          <ellipse key={r} transform={`rotate(${r})`} rx="5" ry="22" fill={c} />
        ))}
      </g>
    </svg>
  );

  return (
    <div className="border-[2.5px] border-[#1a237e] p-6 bg-white font-sans text-zinc-900 relative overflow-hidden w-full max-w-[440px] mx-auto text-[13px]" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Watermark Fan */}
      <svg className="absolute opacity-[0.06] pointer-events-none" style={{ top: "45%", left: "50%", transform: "translate(-50%, -50%)" }} width="260" height="260" viewBox="0 0 260 260">
        <g transform="translate(130,130)">
          {[-90, -60, -30, 0, 30, 60, 90].map((r, i) => (
            <ellipse key={r} transform={`rotate(${r})`} rx="17" ry="68" fill={["#c0392b", "#1a237e", "#e8c9b8", "#1a237e", "#c0392b", "#e8c9b8", "#1a237e"][i]} />
          ))}
        </g>
      </svg>

      <FanLogo />
      
      <div className="text-center mb-4">
        <div className="text-[34px] font-bold text-[#c0392b] tracking-wide leading-none" style={{ fontFamily: "Arial, sans-serif" }}>DARBAR BANQUET</div>
      </div>

      {/* R.No */}
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-[13px] font-bold">R.No.</span>
        <div className="border-b border-[#1a237e] text-center px-2 min-w-[90px]" style={{ minHeight: 18 }}>
          {data.rNo && <span className="text-[14px] font-bold">{data.rNo}</span>}
        </div>
      </div>

      {/* Date */}
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Date :</span>
        <div className="w-48 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.date && <span className="text-[13px]">{formatDate(data.date)}</span>}
        </div>
      </div>

      {/* Received From */}
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Received with thanks from Mr.</span>
        <div className="flex-1 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.clientName && <span className="text-[13px]">{data.clientName}</span>}
        </div>
      </div>

      {/* Resident of */}
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Resident of</span>
        <div className="flex-1 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.resident && <span className="text-[13px]">{data.resident}</span>}
        </div>
      </div>

      {/* WhatsApp & Phone */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">WhatsApp.</span>
        <div className="w-40 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.whatsapp && <span className="text-[13px]">{data.whatsapp}</span>}
        </div>
        <span className="text-[13px] font-bold whitespace-nowrap">Phone.</span>
        <div className="flex-1 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.phone && <span className="text-[13px]">{data.phone}</span>}
        </div>
      </div>

      {/* Reserved For Date & Day */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">has been reserved for</span>
        <div className="flex-1 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.reservationDate && <span className="text-[13px]">{formatDate(data.reservationDate)}</span>}
        </div>
        <span className="text-[13px] font-bold whitespace-nowrap">Day</span>
        <div className="w-28 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.day && <span className="text-[13px]">{data.day}</span>}
        </div>
      </div>

      {/* Function & No. Of Guest */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Function</span>
        <div className="flex-1 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.functionName && <span className="text-[13px]">{data.functionName}</span>}
        </div>
        <span className="text-[13px] font-bold whitespace-nowrap">No. Of Guest</span>
        <div className="w-24 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.noOfGuests && <span className="text-[13px]">{data.noOfGuests}</span>}
        </div>
      </div>

      {/* Lump Sum */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Lump Sum</span>
        <div className="w-56 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.lumpSum && <span className="text-[13px]">{data.lumpSum}</span>}
        </div>
      </div>

      {/* Advance */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Advance</span>
        <div className="w-56 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
          {data.advance && <span className="text-[13px]">{data.advance}</span>}
        </div>
      </div>

      {/* Balance & Signature Layout */}
      <div className="flex items-end justify-between gap-4 mb-3">
        <div className="flex items-end gap-2 flex-1">
          <span className="text-[13px] font-bold whitespace-nowrap">Balance</span>
          <div className="w-56 border-b border-[#1a237e] text-center" style={{ minHeight: 18 }}>
            {balance && <span className="text-[13px]">{balance}</span>}
          </div>
        </div>

        <div className="flex flex-col items-center min-w-[130px]">
          <div className="relative h-9 w-28 flex items-end justify-center">
            <img className="absolute bottom-0 w-28 object-contain z-10 pointer-events-none" src="/manager-signature.png" alt="Manager Signature" />
          </div>
          <div className="w-full border-b border-[#1a237e]" style={{ minHeight: 1 }}></div>
          <span className="text-[13px] font-bold mt-0.5">Manager</span>
        </div>
      </div>

      {/* Terms & Conditions Pill */}
      <div className="text-center my-2.5">
        <span className="bg-[#c0392b] text-white text-[12px] font-bold px-7 py-1 rounded-full inline-block">Terms &amp; Conditions</span>
      </div>

      <ul className="text-[10px] space-y-1 leading-tight mb-2">
        {[
          "Advance non refundable. Balance must be paid within 48 hours prior your event.",
          "Cold drinks are strictly not allowed from outside. All drinks are available at company price @ Rs.1500 per crate chilled on counter. NESTLE / AQUAFINA water bottle for Rs.150 per table with service.",
          "Fresh flower stage is not included in your booking amount.",
          "Premises should be vacated before 12 a.m.",
          "No musical function is allowed without concerned authorities permission.",
          "Car parking at your own risk.",
          "Management will not be responsible for loss of any kind of property."
        ].map((t, i) => (
          <li key={i} className="flex gap-1.5 items-start">
            <span className="text-[#c0392b] text-[9px] leading-none mt-1">●</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <div className="text-[11px] mb-2">I have read &amp; agreed to the above terms &amp; conditions.</div>
      <div className="border-t-[1.5px] border-[#c0392b] mb-2"></div>

      {/* Footer Split Layout with Updated Single Phone Number */}
      <div className="grid grid-cols-2 relative pt-1 pb-1">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#e2d9d2]"></div>
        
        <div className="pr-2">
          <div className="text-[9.5px] font-bold text-[#c0392b] mb-0.5">📍 LOCATION</div>
          <div className="text-[11px] font-bold text-[#1a237e] leading-tight">D-16, Block "N" Near Sakhi Hassan,</div>
          <div className="text-[11px] font-bold text-[#1a237e] leading-tight">North Nazimabad, Karachi.</div>
        </div>
        
        <div className="pl-3">
          <div className="text-[9.5px] font-bold text-[#c0392b] mb-0.5">📞 CONTACT US</div>
          <div className="text-[10px] font-bold text-[#1a237e] leading-tight">WhatsApp: 0300 8207221</div>
          <div className="text-[10px] font-bold text-[#1a237e] leading-tight">Phone: 0300 2319171</div>
        </div>
      </div>
    </div>
  );
}

const formatWhatsAppNumber = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("92")) {
    cleaned = "+" + cleaned;
  } else if (cleaned.startsWith("0")) {
    cleaned = "+92" + cleaned.slice(1);
  } else {
    cleaned = "+" + cleaned;
  }

  return `whatsapp:${cleaned}`;
};

export default function DarbarReceiptForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: defaultForm,
  });

  const printRef = useRef();
  const formData = watch();

  const handleReservationDateChange = (e) => {
    const val = e.target.value;
    setValue("reservationDate", val);
    if (val) {
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        setValue("day", days[dateObj.getDay()]);
      }
    }
  };

  const autoBalance = () => {
    const l = parseFloat(String(formData.lumpSum).replace(/,/g, "")) || 0;
    const a = parseFloat(String(formData.advance).replace(/,/g, "")) || 0;
    if (l && a) setValue("balance", (l - a).toLocaleString());
  };
  
  const onError = (errors) => {
    const firstKey = Object.keys(errors)[0];
    const message = errors[firstKey]?.message;
    if (message) {
      toast.error(message);
    } else if (firstKey) {
      toast.error(`Please fill out the required field: ${firstKey}`);
    } else {
      toast.error("Please fill out all required fields.");
    }
  };

  const onSubmit = async (data) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    const fixedData = {
      rNo: data.rNo,
      date: formatDate(data.date),
      clientName: data.clientName,
      resident: data.resident,
      whatsapp: data.whatsapp,
      phone: !data.phone || data.phone === "-" ? "" : data.phone,
      reservationDate: formatDate(data.reservationDate),
      day: data.day,
      functionName: data.functionName,
      noOfGuests: data.noOfGuests,
      lumpSum: data.lumpSum,
      advance: data.advance,
      balance: data.balance,
    };

    const formattedData = {
      ...fixedData,
      whatsapp: formatWhatsAppNumber(fixedData.whatsapp),
    };

    const bookingPayload = {
      rNo: data.rNo || "1",
      client: data.clientName || "Walk-in Client",
      phone: data.phone || data.whatsapp || "03000000000",
      event: data.functionName || "Wedding",
      package: data.package || "Standard",
      venue: data.venue || "Hall A",
      date: data.reservationDate ? new Date(data.reservationDate).toISOString() : new Date().toISOString(),
      totalAmount: Number(data.lumpSum) || 0,
      advanceAmount: Number(data.advance) || 0,
      // `advance_paid` in DB is numeric (amount). Send numeric paid amount here.
      advancePaid: Number(data.advance) || 0,
      paymentMethod: "Cash",
      timeSlot: "Night",
      status: "Confirmed",
      guests: Number(data.noOfGuests) || 0,
    };

    // 1. Create the booking FIRST — the receipt should only go out once this succeeds.
    const bookingResult = await bookingService.createBooking(bookingPayload);

    if (bookingResult?.success === false) {
      // Backend responded but flagged failure explicitly — show its actual reason.
      toast.error(bookingResult.message || "Failed to create booking");
      return; // stop here — do not send the receipt for a booking that wasn't created
    }

    // 2. Booking confirmed — now send the receipt.
    let receiptResult;
    try {
      receiptResult = await receiptService.sendReceipt(formattedData);
    } catch (receiptError) {
      // Booking succeeded but the receipt failed — say so specifically, don't call it a booking failure.
      const receiptMessage = receiptError?.response?.data?.message || receiptError?.message || "Receipt failed to send";
      toast.error(`Booking created, but receipt failed: ${receiptMessage}`);
      return;
    }

    if (receiptResult?.success === true) {
      toast.success("Receipt Sent & Booking Created!");
    } else {
      toast.success("Booking created! Receipt processed.");
    }
  } catch (error) {
    // Covers createBooking throwing (network error, validation error, DB constraint, etc.)
    // Surface whatever the backend actually said instead of a generic message.
    console.error("An error occurred: ", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create booking. Please try again.";
    toast.error(message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 sm:mb-7">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Darbar Banquet</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1" style={{ fontFamily: "Georgia, serif" }}>Receipt Generator</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Fill in the details — receipt updates live{" "}
            <span className="lg:hidden">below</span>
            <span className="hidden lg:inline">on the right</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreviewMobile(v => !v)}
          className="lg:hidden mb-4 w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          {showPreviewMobile ? "Show Form" : "Show Receipt Preview"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className={`space-y-5 ${showPreviewMobile ? "hidden lg:block" : ""}`}
          >
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Receipt Info</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="R. No.">
                  <input className={inp} placeholder="730" {...register("rNo", { required: true })} />
                </Field>
                <Field label="Date" icon={CalendarDays}>
                  <input type="date" className={inp} {...register("date", { required: true })} />
                </Field>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Client Information</p>
              <div className="space-y-4">
                <Field label="Client Name" icon={User}>
                  <input className={inp} placeholder="Mr. Ali Ahmed" {...register("clientName", { required: true })} />
                </Field>
                <Field label="Resident of" icon={MapPin}>
                  <input className={inp} placeholder="North Nazimabad, Karachi" {...register("resident", { required: true })} />
                </Field>
                <Field label="WhatsApp Number" icon={MessageCircle}>
                  <input
                    className={inp}
                    placeholder="0300-1234567"
                    {...register("whatsapp", {
                      required: true,
                      validate: (v) => isValidPhoneLength(v) || "Enter a valid 11-digit number",
                    })}
                  />
                </Field>

                <Field label="Phone Number" icon={Phone}>
                  <input
                    className={inp}
                    placeholder="021-1234567"
                    {...register("phone", {
                      validate: (v) => isValidPhoneLength(v) || "Enter a valid 11-digit number",
                    })}
                  />
                </Field>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Event Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Reserved For Date" icon={CalendarDays}>
                  <input 
                    type="date" 
                    className={inp} 
                    {...register("reservationDate", { required: true })}
                    onChange={handleReservationDateChange}
                  />
                </Field>
                <Field label="Day">
                  <select className={sel} {...register("day", { required: true })}>
                    <option value="">Select Day</option>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Function" icon={CalendarDays}>
                  <select className={sel} {...register("functionName", { required: true })}>
                    <option value="">Select Function</option>
                    {FUNCS.map(fn => <option key={fn}>{fn}</option>)}
                  </select>
                </Field>
                <Field label="No. of Guests" icon={Users}>
                  <input type="number" className={inp} placeholder="350" {...register("noOfGuests", { required: true })} />
                </Field>
                <Field label="Venue" icon={Building2}>
                  <select className={sel} {...register("venue", { required: true })}>
                    {HALLS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Payment Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Lump Sum (Rs.)" icon={Wallet}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="850000"
                    {...register("lumpSum", { required: true })}
                    onBlur={autoBalance}
                  />
                </Field>
                <Field label="Advance (Rs.)" icon={CreditCard}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="300000"
                    {...register("advance", { required: true })}
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
                        {...register("balance", { required: true })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-medium">auto</span>
                    </div>
                  </Field>
                </div>
              </div>

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