const { db } = require("../config/db");
const b = require("../model/schema");
const { gte, lte, and, inArray, sql } = require("drizzle-orm");

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

  const relatedBookingIds = [
    ...rangeAddons.map((addon) => addon.bookingId),
    ...rangePayments.map((payment) => payment.bookingId),
  ].filter(Boolean);
  const relatedBookings = relatedBookingIds.length > 0
    ? await db.select({ id: b.booking.id, client: b.booking.client, rNo: b.booking.r_no })
      .from(b.booking)
      .where(inArray(b.booking.id, relatedBookingIds))
    : [];
  const bookingById = new Map(relatedBookings.map((booking) => [booking.id, booking]));

  const paymentBookingIds = new Set(allPayments.map((p) => p.bookingId));

  const activity = [];
  let totalIn = 0;
  let cashIn = 0;
  let totalOut = 0;
  let cashOut = 0; // NEW — mirrors cashIn, so net can be pure cash-in-hand
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

  const addInflow = (id, time, category, note, who, method, amount, bank, extra = {}) => {
    if (amount <= 0) return;
    const m = resolveInflowMethod(method, bank);
    byMethod[m] = (byMethod[m] || 0) + amount;
    totalIn += amount;
    if (m === "Cash") cashIn += amount;
    activity.push({ id, time, flow: "IN", category, note, who, method: m, amount, ...extra });
  };

  // Outflows now resolve method the same way inflows do, so a vendor
  // payout or expense paid via bank/JazzCash/etc. doesn't get treated as
  // a cash outflow — otherwise it wrongly drags down cash-in-hand.
  const addOutflow = (id, time, category, note, who, method, amount, extra = {}) => {
    if (amount <= 0) return;
    const m = (method || "Cash").trim() || "Cash";
    totalOut += amount;
    if (m.toLowerCase() === "cash") cashOut += amount;
    activity.push({ id, time, flow: "OUT", category, note, who, method: m, amount, ...extra });
  };

  rangePayments.forEach((p) => {
    const isAddonPayment = (p.category || "").toLowerCase() === "addon";
    const booking = bookingById.get(p.bookingId);
    const addonService = isAddonPayment
      ? (p.note || "").replace(/^Add-on #\d+:\s*/i, "")
      : null;
    addInflow(
      `payment-${p.id}`,
      p.created_at,
      isAddonPayment ? "Addon" : p.category || "Payment",
      isAddonPayment ? addonService || "Addon Payment" : p.note || `Payment Received (${p.category || "Booking"})`,
      booking?.client || p.who || null,
      p.payment_method || "Cash",
      Number(p.amount || 0),
      p.bank_name,
      isAddonPayment
        ? { receiptNo: booking?.rNo || null, addonService }
        : { receiptNo: booking?.rNo || null }
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
          bk.bank_name,
          { receiptNo: bk.r_no || null }
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
          bk.bank_name,
          { receiptNo: bk.r_no || null }
        );
      }
    }
  });

  // Addon money IN — what the client paid for the addon service.
  rangeAddons.forEach((a) => {
    if (!a.received) return; // not yet collected from client
    const hasPayment = rangePayments.some(
      (payment) => payment.bookingId === a.bookingId
        && (payment.category || "").toLowerCase() === "addon"
        && Number(payment.amount || 0) === Number(a.client_price || 0)
    );
    if (hasPayment) return;
    const booking = bookingById.get(a.bookingId);
    const clientPrice = Number(a.client_price || 0);
    if (clientPrice <= 0) return;

    addInflow(
      `addon-${a.id}`,
      a.received_at || a.created_at,
      "Addon",
      a.service || "Addon Service",
      booking?.client || "Unknown Client",
      a.payment_method || "Cash",
      clientPrice,
      a.bank_name,
      { receiptNo: booking?.rNo || null, addonService: a.service || null }
    );
  });

  // Addon money OUT — what gets paid to the vendor for that same addon.
  rangeAddons.forEach((a) => {
    if (!a.received) return; // vendor only gets paid once client has paid
    const booking = bookingById.get(a.bookingId);
    const vendorCost = Number(a.vendor_cost || 0);
    if (vendorCost <= 0) return;

    addOutflow(
      `addon-vendor-${a.id}`,
      a.received_at || a.created_at,
      "Vendor Payout",
      a.service || "Addon Service",
      booking?.client || "Unknown Client",
      a.payment_method || "Cash",
      vendorCost,
      { receiptNo: booking?.rNo || null, addonService: a.service || null }
    );
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
    net: cashIn - cashOut, // pure cash-in-hand: bank/JazzCash/EasyPaisa money on both sides excluded
    byMethod,
    activity,
  };
}

module.exports = { computeCashflowSummary };