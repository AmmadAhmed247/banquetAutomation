import { SlidersHorizontal } from "lucide-react";
import { currency } from "./ManagementUtils";

export function BookingLedger({
  ledgerSearch,
  setLedgerSearch,
  setLedgerPage,
  ledgerFilteredBookings,
  displayedLedgerBookings,
  ledgerPage,
  ledgerTotalPages,
  expensesByBooking,
  addonsByBooking,
  selectedBookingId,
  setSelectedBookingId,
  setAddingTo,
}) {
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter out past bookings (keep only today onwards)
  const upcomingBookings = displayedLedgerBookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-[15px] font-bold text-stone-900">Booking Ledger</h2>
        <div className="bg-stone-50 p-1.5 rounded-lg">
            <SlidersHorizontal size={13} className="text-stone-400" />
            </div>
      </div>
      <div className="px-6 py-3.5 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <input
            value={ledgerSearch}
            onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
            placeholder="Search bookings..."
            className="px-3.5 py-2 border border-stone-200 rounded-xl text-[13px] outline-none w-64 focus:border-stone-400 transition-colors"
          />
          <div className="text-[12px] text-stone-400 font-medium">{upcomingBookings.length} results</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50/70 border-b border-stone-100">
              {["Client", "Hall", "Event", "Date", "Revenue", "Costs", "Profit", ""].map(h => (
                <th key={h} className="px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {upcomingBookings.map(b => {
              const bA = addonsByBooking[b.id] || []; const bE = expensesByBooking[b.id] || [];
              const aR = bA.reduce((s, a) => s + (a.received ? Number(a.client_price) : 0), 0);
              const vE = bA.reduce((s, a) => s + (a.received ? Number(a.vendor_cost) : 0), 0);
              const tR = b.revenue + aR; const tE = bE.reduce((s, e) => s + Number(e.amount), 0) + vE;
              return (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`cursor-pointer transition-colors ${selectedBookingId === b.id ? "bg-emerald-50/60" : "hover:bg-stone-50"}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-stone-800">{b.client}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${b.hall === "Hall A" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>
                      {b.hall}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-stone-500">{b.event}</td>
                  <td className="px-5 py-3.5 text-[12px] text-stone-400">
                    {new Date(b.date).toLocaleDateString("en-US", { timeZone: "Asia/Karachi", day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-bold text-stone-800">{currency(tR)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-rose-600">{currency(tE)}</td>
                  <td className={`px-5 py-3.5 text-[13px] font-bold ${tR - tE >= 0 ? "text-emerald-700" : "text-rose-600"}`}>{currency(tR - tE)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingTo(b.id); setSelectedBookingId(b.id); }}
                      className="text-[11px] font-semibold px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
                    >
                      + Add
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!ledgerSearch.trim() && (
        <div className="px-6 py-3.5 flex items-center justify-end gap-2 border-t border-stone-100">
          <button onClick={() => setLedgerPage(p => Math.max(1, p - 1))} disabled={ledgerPage === 1} className="px-3 py-1.5 rounded-lg border border-stone-200 text-[12px] font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors">Prev</button>
          <div className="text-[12px] text-stone-500 font-medium">Page {ledgerPage} of {ledgerTotalPages}</div>
          <button onClick={() => setLedgerPage(p => Math.min(ledgerTotalPages, p + 1))} disabled={ledgerPage === ledgerTotalPages} className="px-3 py-1.5 rounded-lg border border-stone-200 text-[12px] font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}