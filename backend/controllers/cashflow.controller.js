const { db } = require("../config/db");
const b = require("../model/schema");
const { gte, lte, and, sql } = require("drizzle-orm");

// GET /api/cashflow?start=YYYY-MM-DD&end=YYYY-MM-DD
const getCashflow = async (req, res) => {
  try {
    const { start: startQ, end: endQ } = req.query;

    const todayStr = new Date().toISOString().split("T")[0];
    const startDate = new Date(`${startQ || todayStr}T00:00:00.000`);
    const endDate = new Date(`${endQ || startQ || todayStr}T23:59:59.999`);

    const [
      rangePayments,
      rangeAddons,
      rangeExpenses,
      rangeDailyExpenses,
      rangeMonthlyExpenses,
      allBookings
    ] = await Promise.all([
      // Real payment receipts in range
      db.select().from(b.payments)
        .where(and(gte(b.payments.created_at, startDate), lte(b.payments.created_at, endDate)))
        .orderBy(sql`${b.payments.created_at} DESC`),

      // Addons in range
      db.select().from(b.addons)
        .where(and(gte(b.addons.created_at, startDate), lte(b.addons.created_at, endDate))),

      // Direct booking expenses in range
      db.select().from(b.expenses)
        .where(and(gte(b.expenses.created_at, startDate), lte(b.expenses.created_at, endDate))),

      // Daily petty cash
      db.select().from(b.dailyExpenses)
        .where(and(
          gte(b.dailyExpenses.date, startQ || todayStr),
          lte(b.dailyExpenses.date, endQ || startQ || todayStr)
        )),

      // Monthly overhead expenses
      db.select().from(b.monthlyExpenses),

      // Fetch bookings created or updated in date range
      db.select().from(b.booking)
        .where(and(gte(b.booking.created_at, startDate), lte(b.booking.created_at, endDate)))
    ]);

    // Map of existing payments by booking ID
    const paymentBookingIds = new Set(rangePayments.map((p) => p.bookingId));

    const activity = [];
    let totalIn = 0;
    let totalOut = 0;
    const byMethod = {};

    // Helper to add Inflow
    const addInflow = (id, time, category, note, who, method, amount) => {
      if (amount <= 0) return;
      const m = method || "Cash";
      byMethod[m] = (byMethod[m] || 0) + amount;
      totalIn += amount;
      activity.push({ id, time, flow: "IN", category, note, who, method: m, amount });
    };

    // Helper to add Outflow
    const addOutflow = (id, time, category, note, who, method, amount) => {
      if (amount <= 0) return;
      totalOut += amount;
      activity.push({ id, time, flow: "OUT", category, note, who, method: method || "Cash", amount });
    };

    // 1. Real Payments Inflow from Payments Table
    rangePayments.forEach((p) => {
      addInflow(
        `payment-${p.id}`,
        p.created_at,
        p.type || "Payment",
        p.note || `${p.type || "Booking"} Payment Received`,
        null,
        p.payment_method,
        Number(p.amount || 0)
      );
    });

    // 2. Bookings Inflow Logic (Status-Based & Legacy Handling)
    allBookings.forEach((bk) => {
      const status = (bk.status || "").toLowerCase();
      if (status === "cancelled") return;

      const totalAmt = Number(bk.total_amount || 0);
      const advancePaid = Number(bk.advance_paid || 0);
      const remainingBalance = Math.max(0, totalAmt - advancePaid);
      const method = bk.payment_method || "Cash";

      // Case A: Legacy/Manual Booking without entry in `payments` table
      if (!paymentBookingIds.has(bk.id)) {
        if (advancePaid > 0) {
          addInflow(
            `booking-adv-${bk.id}`,
            bk.created_at,
            "Advance Payment",
            `Advance for ${bk.event || "Event"} (${bk.client})`,
            bk.client,
            method,
            advancePaid
          );
        }
      }

      // Case B: Status is Finished / Completed -> Add Remaining Settlement Inflow
      if (status === "finished" || status === "completed") {
        if (remainingBalance > 0) {
          addInflow(
            `booking-settlement-${bk.id}`,
            bk.updated_at || bk.created_at,
            "Final Settlement",
            `Remaining balance collected for finished event (${bk.client})`,
            bk.client,
            method,
            remainingBalance
          );
        }
      }
    });

    // 3. Addon Vendor Payouts (Outflow)
    rangeAddons.forEach((a) => {
      addOutflow(`addon-vendor-${a.id}`, a.created_at, "Vendor Payout", `${a.service} (Vendor)`, null, "Cash/Bank", Number(a.vendor_cost || 0));
    });

    // 4. Booking Direct Expenses (Outflow)
    rangeExpenses.forEach((e) => {
      addOutflow(`expense-${e.id}`, e.created_at, e.category || "Expense", e.label || "Event Expense", null, "Cash", Number(e.amount || 0));
    });

    // 5. Daily Petty Cash (Outflow)
    rangeDailyExpenses.forEach((d) => {
      addOutflow(`daily-${d.id}`, d.date, d.category || "Daily Expense", d.label || "Daily Petty Cash", null, "Cash", Number(d.amount || 0));
    });

    // 6. Monthly Overhead Expenses (Outflow)
    const targetMonth = startDate.getMonth() + 1;
    const targetYear = startDate.getFullYear();

    rangeMonthlyExpenses.forEach((m) => {
      if (Number(m.month) === targetMonth && Number(m.year) === targetYear) {
        addOutflow(
          `monthly-${m.id}`,
          new Date(targetYear, targetMonth - 1, 1),
          "Monthly Overhead",
          m.label || m.category,
          null,
          "Bank/Cash",
          Number(m.amount || 0)
        );
      }
    });

    // Sort all activity by timestamp descending
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return res.status(200).json({
      success: true,
      data: {
        totalIn,
        totalOut,
        net: totalIn - totalOut,
        byMethod,
        activity,
      },
    });
  } catch (err) {
    console.error("Error building cashflow summary:", err);
    return res.status(500).json({ success: false, message: "Failed to compute cashflow" });
  }
};

module.exports = { getCashflow };