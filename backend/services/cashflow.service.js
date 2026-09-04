const { db } = require("../config/db");
const b = require("../model/schema");
const { gte, lte, and, sql } = require("drizzle-orm");

/**
 * Computes a full cashflow summary (inflows, outflows, net, activity log)
 * for the given date range. Shared by the /api/cashflow route and the
 * daily WhatsApp summary cron job, so both always agree on the numbers.
 */
const KARACHI_OFFSET_MIN = 5 * 60;



function karachiDateString(date) {
  const pktDate = new Date(date.getTime() + KARACHI_OFFSET_MIN * 60000);
  return `${pktDate.getUTCFullYear()}-${String(pktDate.getUTCMonth() + 1).padStart(2, "0")}-${String(pktDate.getUTCDate()).padStart(2, "0")}`;
}

async function computeCashflowSummary(startDate, endDate, { startQ, endQ } = {}) {
  const todayStr = karachiDateString(new Date());
  const effectiveStartQ = startQ || karachiDateString(startDate);
  const effectiveEndQ = endQ || karachiDateString(endDate);

  const [
    rangePayments,
    allPayments,
    rangeAddons,
    rangeExpenses,
    rangeDailyExpenses,
    rangeMonthlyExpenses,
    allBookings
  ] = await Promise.all([
    db.select().from(b.payments)
      .where(and(gte(b.payments.created_at, startDate), lte(b.payments.created_at, endDate)))
      .orderBy(sql`${b.payments.created_at} DESC`),

    db.select({ bookingId: b.payments.bookingId }).from(b.payments),

    db.select().from(b.addons)
      .where(and(gte(b.addons.created_at, startDate), lte(b.addons.created_at, endDate))),

    db.select().from(b.expenses)
      .where(and(gte(b.expenses.created_at, startDate), lte(b.expenses.created_at, endDate))),

    db.select().from(b.dailyExpenses)
      .where(and(
        gte(b.dailyExpenses.date, effectiveStartQ || todayStr),
        lte(b.dailyExpenses.date, effectiveEndQ || effectiveStartQ || todayStr)
      )),

    db.select().from(b.monthlyExpenses),

    db.select().from(b.booking)
      .where(and(gte(b.booking.created_at, startDate), lte(b.booking.created_at, endDate)))
  ]);

  const paymentBookingIds = new Set(allPayments.map((p) => p.bookingId));

  const activity = [];
  let totalIn = 0;
  let totalOut = 0;
  const byMethod = {};

  const resolveInflowMethod = (method, bank) => {
    const normalizedMethod = (method || "").trim().toLowerCase();
    const normalizedBank = (bank || "").trim().toLowerCase();

    if (normalizedBank === "meezan bank sadar") return "Meezan Bank Sadar";
    if (normalizedBank === "habib metro usman") return "Habib Metro Usman";
    if (normalizedMethod === "cash") return "Cash";
    if (normalizedMethod === "jazzcash") return "JazzCash";
    if (normalizedMethod === "easypaisa") return "EasyPaisa";
    if (normalizedMethod === "bank transfer" || normalizedBank) return "Other Banks";
    return method || "Cash";
  };

  const addInflow = (id, time, category, note, who, method, amount, bank) => {
    if (amount <= 0) return;
    const m = resolveInflowMethod(method, bank);
    byMethod[m] = (byMethod[m] || 0) + amount;
    totalIn += amount;
    activity.push({ id, time, flow: "IN", category, note, who, method: m, amount });
  };

  const addOutflow = (id, time, category, note, who, method, amount) => {
    if (amount <= 0) return;
    totalOut += amount;
    activity.push({ id, time, flow: "OUT", category, note, who, method: method || "Cash", amount });
  };

  rangePayments.forEach((p) => {
    addInflow(
      `payment-${p.id}`,
      p.created_at,
      p.category || "Payment",
      p.note || `Payment Received (${p.category || "Booking"})`,
      p.who || null,
      p.payment_method || "Cash",
      Number(p.amount || 0),
      p.bank_name
    );
  });

  allBookings.forEach((bk) => {
    const status = (bk.status || "").toLowerCase();
    if (status === "cancelled") return;

    const totalAmt = Number(bk.total_amount || 0);
    const advancePaid = Number(bk.advance_paid || 0);
    const remainingBalance = Math.max(0, totalAmt - advancePaid);
    const method = bk.payment_method || "Cash";

    if (!paymentBookingIds.has(bk.id)) {
      if (advancePaid > 0) {
        addInflow(
          `booking-adv-${bk.id}`,
          bk.created_at,
          "Advance Payment",
          `Advance for ${bk.event || "Event"} (${bk.client})`,
          bk.client,
          method,
          advancePaid,
          bk.bank_name
        );
      }

      if ((status === "finished" || status === "completed") && remainingBalance > 0) {
        addInflow(
          `booking-settlement-${bk.id}`,
          bk.updated_at || bk.created_at,
          "Final Settlement",
          `Remaining balance collected for finished event (${bk.client})`,
          bk.client,
          method,
          remainingBalance,
          bk.bank_name
        );
      }
    }
  });

  rangeAddons.forEach((a) => {
    if (!a.received) return; // skip if not yet received
    addOutflow(`addon-vendor-${a.id}`, a.created_at, "Vendor Payout", `${a.service} (Vendor)`, null, a.payment_method || "Cash", Number(a.vendor_cost || 0));
  });

  rangeExpenses.forEach((e) => {
    addOutflow(`expense-${e.id}`, e.created_at, e.category || "Expense", e.label || "Event Expense", null, "Cash", Number(e.amount || 0));
  });

  rangeDailyExpenses.forEach((d) => {
    addOutflow(`daily-${d.id}`, d.date, d.category || "Daily Expense", d.label || "Daily Petty Cash", null, "Cash", Number(d.amount || 0));
  });

  const [startYearStr, startMonthStr] = effectiveStartQ.split("-");
  const [endYearStr, endMonthStr] = effectiveEndQ.split("-");
  const startMonthIndex = Number(startYearStr) * 12 + Number(startMonthStr) - 1;
  const endMonthIndex = Number(endYearStr) * 12 + Number(endMonthStr) - 1;

  rangeMonthlyExpenses.forEach((m) => {
    const expenseMonthIndex = Number(m.year) * 12 + Number(m.month) - 1;
    if (expenseMonthIndex >= startMonthIndex && expenseMonthIndex <= endMonthIndex) {
      addOutflow(
        `monthly-${m.id}`,
        new Date(`${m.year}-${String(m.month).padStart(2, "0")}-01T00:00:00.000+05:00`),
        "Monthly Overhead",
        m.label || m.category,
        null,
        "Cash",
        Number(m.amount || 0)
      );
    }
  });

  activity.sort((a, b2) => new Date(b2.time).getTime() - new Date(a.time).getTime());


  return {
    totalIn,
    totalOut,
    net: totalIn - totalOut,
    byMethod,
    activity,
  };
}

module.exports = { computeCashflowSummary };