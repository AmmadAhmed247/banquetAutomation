const { db } = require("../config/db");
const { bookings, booking, payments, addons, expenses, dailyExpenses, monthlyExpenses } = require("../model/schema");
const { sql } = require("drizzle-orm");

// NOTE: model/schema exports `booking` singular etc. We'll reference those directly.
const b = require("../model/schema");

function parseDateInput(q) {
  if (!q) return null;
  const d = new Date(q);
  if (isNaN(d.getTime())) return null;
  return d;
}

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD
const getCashflow = async (req, res) => {
  try {
    const startQ = req.query.start;
    const endQ = req.query.end;

    // When start/end are passed as YYYY-MM-DD, treat them as full-day bounds
    const startDate = startQ ? new Date(`${startQ}T00:00:00.000`) : new Date(new Date().setHours(0,0,0,0));
    const endDate = endQ ? new Date(`${endQ}T23:59:59.999`) : new Date(new Date().setHours(23,59,59,999));

    // Fetch raw data in parallel
    const [allBookings, allPayments, allAddons, allExpenses, allDailyExpenses, allMonthlyExpenses] = await Promise.all([
      db.select().from(b.booking),
      db.select().from(b.payments).orderBy(sql`${b.payments.created_at} DESC`),
      db.select().from(b.addons),
      db.select().from(b.expenses),
      db.select().from(b.dailyExpenses),
      db.select().from(b.monthlyExpenses),
    ]);

    // Helper to check if a timestamp falls in range
    const inRange = (raw) => {
      if (!raw) return false;
      const d = new Date(raw);
      return d >= startDate && d <= endDate;
    };

    // Map payments by bookingId (for lookups and totals)
    const paymentsByBooking = {};
    allPayments.forEach((p) => {
      const bId = p.booking_id || p.bookingId;
      if (!bId) return;
      paymentsByBooking[bId] = paymentsByBooking[bId] || [];
      paymentsByBooking[bId].push(p);
    });

    // Build activity list and running sums
    const activity = [];
    let totalIn = 0;
    let totalOut = 0;
    const byMethod = {};

    // 1) Payments table entries (real receipts)
    allPayments.forEach((p) => {
      if (!inRange(p.created_at)) return;
      const amount = Number(p.amount || 0);
      if (amount <= 0) return;

      const method = p.payment_method || p.paymentMethod || "Cash";
      byMethod[method] = (byMethod[method] || 0) + amount;

      activity.push({
        id: `payment-${p.id}`,
        time: p.created_at,
        flow: "IN",
        category: p.type || "Payment",
        note: p.note || p.type || "Booking Payment",
        who: null,
        method,
        amount,
      });

      totalIn += amount;
    });

    // 2) Addons (inflows) and their vendor payouts (outflows)
    allAddons.forEach((a) => {
      if (!inRange(a.created_at)) return;
      const price = Number(a.client_price || a.clientPrice || 0);
      const vendor = Number(a.vendor_cost || a.vendorCost || 0);
      if (price > 0) {
        activity.push({ id: `addon-${a.id}`, time: a.created_at, flow: "IN", category: "Add-on", note: a.service, who: null, method: "Cash/Direct", amount: price });
        totalIn += price;
      }
      if (vendor > 0) {
        activity.push({ id: `addon-vendor-${a.id}`, time: a.created_at, flow: "OUT", category: "Vendor Payout", note: a.service, who: null, method: "Cash/Bank", amount: vendor });
        totalOut += vendor;
      }
    });

    // 3) Expenses
    allExpenses.forEach((e) => {
      if (!inRange(e.created_at)) return;
      const amt = Number(e.amount || 0);
      if (amt <= 0) return;
      activity.push({ id: `expense-${e.id}`, time: e.created_at, flow: "OUT", category: e.category || "Expense", note: e.label || e.description, who: null, method: "—", amount: amt });
      totalOut += amt;
    });

    // 4) Daily petty cash
    allDailyExpenses.forEach((d) => {
      if (!inRange(d.date)) return;
      const amt = Number(d.amount || 0);
      if (amt <= 0) return;
      // dailyExpenses use `date` instead of created_at
      activity.push({ id: `daily-${d.id}`, time: d.date, flow: "OUT", category: d.category || "Daily Expense", note: d.label || "Daily", who: null, method: "Cash", amount: amt });
      totalOut += amt;
    });

    // 5) For bookings that do not have payments records within the range, infer inflow from booking fields
    allBookings.forEach((bk) => {
      // ignore cancelled bookings
      if ((bk.status || "").toLowerCase() === "cancelled") return;

      // prefer payment records if present (they were already added above)
      const hasAnyPayment = (paymentsByBooking[bk.id] || []).length > 0;

      // Determine an appropriate date for inferred booking entries
      const refDate = bk.updated_at || bk.created_at || bk.date || new Date();
      if (!inRange(refDate)) return; // skip booking if not in requested date range

      if (!hasAnyPayment) {
        // If booking is finished, assume full amount received
        const total = Number(bk.total_amount || bk.totalAmount || 0);
        const advance = Number(bk.advance_paid || bk.advancePaid || 0);

        if ((bk.status || "").toLowerCase() === "finished") {
          // Add one inflow for total
          if (total > 0) {
            activity.push({ id: `booking-${bk.id}`, time: refDate, flow: "IN", category: "Booking (inferred)", note: `Booking ${bk.event || ""}`, who: bk.client || null, method: bk.payment_method || "Cash", amount: total });
            totalIn += total;
            byMethod[bk.payment_method || "Cash"] = (byMethod[bk.payment_method || "Cash"] || 0) + total;
          }
        } else {
          // Not finished: treat recorded advance_paid as inflow
          if (advance > 0) {
            activity.push({ id: `booking-adv-${bk.id}`, time: refDate, flow: "IN", category: "Advance (inferred)", note: `Advance for ${bk.event || ""}`, who: bk.client || null, method: bk.payment_method || "Cash", amount: advance });
            totalIn += advance;
            byMethod[bk.payment_method || "Cash"] = (byMethod[bk.payment_method || "Cash"] || 0) + advance;
          }
        }
      } else {
        // There are payment rows for this booking. If some payments occurred outside the requested range, they were already counted; skip.
      }
    });

    // 6) Monthly recurring overheads - include if their month/year falls in range
    allMonthlyExpenses.forEach((m) => {
      // monthlyExpenses have month (1-12) and year
      const month = Number(m.month) - 1; // convert to 0-index
      const year = Number(m.year);
      const d = new Date(year, month, 1);
      if (!inRange(d)) return;
      const amt = Number(m.amount || 0);
      if (amt > 0) {
        activity.push({ id: `monthly-${m.id}`, time: d, flow: "OUT", category: "Monthly Overhead", note: m.label || m.category, who: null, method: "—", amount: amt });
        totalOut += amt;
      }
    });

    // Sort activity by time desc
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return res.status(200).json({ success: true, data: { totalIn, totalOut, net: totalIn - totalOut, byMethod, activity } });
  } catch (err) {
    console.error("Error building cashflow summary:", err);
    return res.status(500).json({ success: false, message: "Failed to compute cashflow" });
  }
};

module.exports = { getCashflow };
