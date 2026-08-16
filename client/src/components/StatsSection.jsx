import { useState } from "react";
import { LayoutGrid, CheckCircle2, Clock, Wallet, ChevronDown } from "lucide-react";
import { getAllAddons } from "../lib/hooks/addon.hook";

export default function StatsSection({ bookings = [] }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const { data: allAddons = [] } = getAllAddons();

  function countedAmount(b) {
    const status = (b.status || "").toLowerCase();
    const totalAmount = Number(b.totalAmount ?? b.total_amount ?? 0);
    const advancePaid = Number(b.advancePaid ?? b.advance_paid ?? 0);
    if (status === "finished" || status === "completed") return totalAmount;
    if (["confirmed", "pending", "cancelled"].includes(status)) return advancePaid;
    return 0;
  }

  // Only addons explicitly marked received count toward revenue — unreceived ones stay excluded
  const receivedAddons = allAddons.filter((a) => a.received);
  const addonRevenue = receivedAddons.reduce((a, x) => a + Number(x.client_price || 0), 0);

  const bookingRevenue = bookings.reduce((a, b) => a + countedAmount(b), 0);
  const revenue = bookingRevenue + addonRevenue;
  const revenueLabel =
    revenue >= 1000000 ? `PKR ${(revenue / 1000000).toFixed(1)}M` : `PKR ${(revenue / 1000).toFixed(0)}K`;

  function resolvePaymentBucket(method, bank) {
    method = (method || "").trim().toLowerCase();
    bank = (bank || "").trim().toLowerCase();
    if (method === "cash" || (!method && !bank)) return "Cash";
    if (method === "jazzcash" || bank === "jazzcash") return "JazzCash";
    if (method === "easypaisa" || bank === "easypaisa") return "EasyPaisa";
    if (bank === "habib metro usman") return "Habib Metro Usman";
    if (bank === "meezan bank sadar") return "Meezan Bank Sadar";
    if (method === "bank transfer" || bank) return "Bank";
    return "Cash";
  }

  const bookingBucketRevenue = bookings
    .filter((b) => resolvePaymentBucket(b.paymentMethod || b.payment_method, b.bankName || b.bank_name) === selectedPaymentMethod)
    .reduce((a, b) => a + countedAmount(b), 0);

  const addonBucketRevenue = receivedAddons
    .filter((a) => resolvePaymentBucket(a.payment_method, a.bank_name) === selectedPaymentMethod)
    .reduce((a, x) => a + Number(x.client_price || 0), 0);

  const filteredPaymentRevenue = bookingBucketRevenue + addonBucketRevenue;
  const filteredPaymentLabel =
    filteredPaymentRevenue >= 1000000
      ? `PKR ${(filteredPaymentRevenue / 1000000).toFixed(1)}M`
      : `PKR ${(filteredPaymentRevenue / 1000).toFixed(0)}K`;

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: LayoutGrid, color: "text-green-600", bg: "bg-green-50" },
    { label: "Confirmed", value: bookings.filter((b) => (b.status || "").toLowerCase() === "confirmed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: bookings.filter((b) => (b.status || "").toLowerCase() === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Revenue", value: revenueLabel, icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl p-3.5 sm:p-4 border border-green-100 shadow-sm flex items-center gap-3 min-w-0">
          <div className={`${s.bg} p-2.5 rounded-xl shrink-0`}>
            <s.icon size={18} className={s.color} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl font-bold text-green-900 truncate">{s.value}</div>
            <div className="text-[11px] text-green-400 font-medium truncate">{s.label}</div>
          </div>
        </div>
      ))}

      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-green-100 shadow-sm flex items-center gap-3 min-w-0">
        <div className="bg-green-50 p-2.5 rounded-xl shrink-0">
          <Wallet size={18} className="text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg sm:text-xl font-bold text-green-900 truncate">{filteredPaymentLabel}</div>
          <div className="relative inline-flex items-center text-[11px] text-green-400 font-medium mt-0.5 w-full">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="appearance-none bg-transparent text-green-600 font-semibold cursor-pointer focus:outline-none pr-6 w-full truncate"
            >
              <option value="Cash">Cash</option>
              <option value="Habib Metro Usman">Habib Metro Usman</option>
              <option value="Meezan Bank Sadar">Meezan Bank Sadar</option>
              <option value="JazzCash">JazzCash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Bank">Other Bank</option>
            </select>
            <ChevronDown size={12} className="text-green-500 absolute right-1 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}