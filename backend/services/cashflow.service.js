const { db } = require("../config/db");
const b = require("../model/schema");
const { gte, lte, and, inArray, sql } = require("drizzle-orm");

/**
 * Computes a full cashflow + finance summary.
 * Shared by /api/cashflow, WhatsApp cron, Expense & Profit page,
 * Add-on Services page, and any other dashboard.
 */
function karachiDateString(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const partMap = {};
  parts.forEach((part) => {
    if (part.type !== "literal") partMap[part.type] = part.value;
  });

  const { year, month, day } = partMap;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

function extractCrates(label = "") {
  const text = String(label || "");
  let match = text.match(/(\d+)\s*(crate|crates|crt)/i);
  if (match) return Number(match[1]);
  match = text.match(/(?:pay\s*to|for|paid)[^\d]*(\d+)/i);
  if (match) return Number(match[1]);
  match = text.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function isPepsi(label = "", category = "") {
  return /pepsi/i.test(label) || /pepsi/i.test(category);
}

function isCoke(label = "", category = "") {
  return /coca\s*cola|coke/i.test(label) || /coca\s*cola|coke/i.test(category);
}

async function computeCashflowSummary(startDate, endDate, { startQ, endQ, range } = {}) {
  const todayStr = karachiDateString(new Date());
  const effectiveStartQ = range === "all" ? "2000-01-01" : (startQ || karachiDateString(startDate));
  const effectiveEndQ = range === "all" ? "2100-12-31" : (endQ || karachiDateString(endDate));

  const [
    rangePayments,
    allPayments,
    rangeAddons,
    rangeExpenses,
    rangeDailyExpenses,
    rangeMonthlyExpenses,
    allBookings,
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

    db.select().from(b.booking),
  ]);

  const relatedBookingIds = [
    ...rangeAddons.map((a) => a.bookingId),
    ...rangePayments.map((p) => p.bookingId),
  ].filter(Boolean);

  const relatedBookings = relatedBookingIds.length > 0
    ? await db.select({ id: b.booking.id, client: b.booking.client, rNo: b.booking.r_no })
        .from(b.booking)
        .where(inArray(b.booking.id, relatedBookingIds))
    : [];

  const bookingById = new Map(relatedBookings.map((b) => [b.id, b]));
  const paymentBookingIds = new Set(allPayments.map((p) => p.bookingId));

  const activity = [];
  let totalIn = 0;
  let cashIn = 0;
  let totalOut = 0;
  const byMethod = {};

  // ── Business Metrics ────────────────────────────────────────────────────
  let grossRevenue = 0;       // Everything the business earned
  let addonCommission = 0;
  let monthlyExpense = 0;
  let dailyExpense = 0;
  let pepsiCrates = 0;
  let cokeCrates = 0;
  let pepsiPaid = 0;
  let cokePaid = 0;

  const resolveInflowMethod = (method, bank) => {
    const m = (method || "").trim().toLowerCase();
    const bnk = (bank || "").trim().toLowerCase();
    if (bnk === "meezan bank sadar") return "Meezan Bank Sadar";
    if (bnk === "habib metro usman") return "Habib Metro Usman";
    if (m === "cash") return "Cash";
    if (m === "jazzcash") return "JazzCash";
    if (m === "easypaisa") return "EasyPaisa";
    if (m === "bank transfer" || bnk) return "Other Banks";
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

  const addOutflow = (id, time, category, note, who, method, amount, extra = {}) => {
    if (amount <= 0) return;
    const m = (method || "Cash").trim() || "Cash";
    totalOut += amount;
    activity.push({ id, time, flow: "OUT", category, note, who, method: m, amount, ...extra });
  };

  // ── 1. Payments (real money that came in) ───────────────────────────────
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
      isAddonPayment ? addonService || "Addon Payment" : p.note || `Payment Received`,
      booking?.client || p.who || null,
      p.payment_method || "Cash",
      Number(p.amount || 0),
      p.bank_name,
      { receiptNo: booking?.rNo || null, addonService }
    );
  });

  // ── 2. Bookings Revenue (for Gross Revenue) ─────────────────────────────
  allBookings.forEach((bk) => {
    const status = (bk.status || "").toLowerCase();
    const totalAmt = Number(bk.total_amount || 0);
    const advancePaid = Number(bk.advance_paid || 0);
    const method = bk.payment_method || "Cash";

    // Gross Revenue rules
    let revenueToCount = 0;
    if (status === "finished" || status === "completed") {
      revenueToCount = totalAmt;                 // Full amount
    } else if (status === "confirmed" || status === "pending") {
      revenueToCount = advancePaid;              // Only advance
    } else if (status === "cancelled") {
      revenueToCount = advancePaid;              // Keep advance if already paid
    }

    // Only count if booking is in the selected date range
    const createdInRange = bk.created_at >= startDate && bk.created_at <= endDate;
    const updatedInRange = bk.updated_at >= startDate && bk.updated_at <= endDate;

    if (revenueToCount > 0 && (createdInRange || updatedInRange)) {
      grossRevenue += revenueToCount;
    }

    // Fallback inflow if no payment record exists
    if (!paymentBookingIds.has(bk.id)) {
      if (advancePaid > 0 && createdInRange) {
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

      if ((status === "finished" || status === "completed") && (totalAmt - advancePaid) > 0 && updatedInRange) {
        addInflow(
          `booking-settlement-${bk.id}`,
          bk.updated_at || bk.created_at,
          "Final Settlement",
          `Remaining balance for finished event (${bk.client})`,
          bk.client,
          method,
          totalAmt - advancePaid,
          bk.bank_name,
          { receiptNo: bk.r_no || null }
        );
      }
    }
  });

  // ── 3. Addons ───────────────────────────────────────────────────────────
  rangeAddons.forEach((a) => {
    if (!a.received) return;

    const clientPrice = Number(a.client_price || 0);
    const vendorCost = Number(a.vendor_cost || 0);
    const booking = bookingById.get(a.bookingId);

    // Avoid double counting if payment already exists
    const hasPayment = rangePayments.some(
      (p) =>
        p.bookingId === a.bookingId &&
        (p.category || "").toLowerCase() === "addon" &&
        Number(p.amount || 0) === clientPrice
    );

    if (clientPrice > 0) {
      // Gross Revenue always includes received addons
      grossRevenue += clientPrice;
      addonCommission += clientPrice - vendorCost;

      if (!hasPayment) {
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
      }
    }

    // Vendor payout (Cost)
    if (vendorCost > 0) {
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
    }
  });

  // ── 4. Standard Expenses ────────────────────────────────────────────────
  rangeExpenses.forEach((e) => {
    addOutflow(
      `expense-${e.id}`,
      e.created_at,
      e.category || "Expense",
      e.label || "Event Expense",
      null,
      "Cash",
      Number(e.amount || 0)
    );
  });

  // ── 5. Daily Expenses + Beverages ───────────────────────────────────────
  rangeDailyExpenses.forEach((d) => {
    const amount = Number(d.amount || 0);
    dailyExpense += amount;

    addOutflow(
      `daily-${d.id}`,
      d.date,
      d.category || "Daily Expense",
      d.label || "Daily Petty Cash",
      null,
      "Cash",
      amount
    );

    const crates = extractCrates(d.label);
    if (isPepsi(d.label, d.category)) {
      pepsiCrates += crates;
      pepsiPaid += amount;
    }
    if (isCoke(d.label, d.category)) {
      cokeCrates += crates;
      cokePaid += amount;
    }
  });

  // ── 6. Monthly Expenses ─────────────────────────────────────────────────
  const [startYearStr, startMonthStr] = effectiveStartQ.split("-");
  const [endYearStr, endMonthStr] = effectiveEndQ.split("-");
  const startMonthIndex = Number(startYearStr) * 12 + Number(startMonthStr) - 1;
  const endMonthIndex = Number(endYearStr) * 12 + Number(endMonthStr) - 1;
  const isSingleDayView = range === "today" || (range === "custom" && startQ && endQ && startQ === endQ);

  rangeMonthlyExpenses.forEach((m) => {
    if (isSingleDayView) return;

    const expenseMonthIndex = Number(m.year) * 12 + Number(m.month) - 1;
    const monthStart = new Date(`${m.year}-${String(m.month).padStart(2, "0")}-01T00:00:00.000+05:00`);
    const createdAt = m.created_at ? new Date(m.created_at) : null;
    const hasExplicitMonth = Number.isFinite(Number(m.year)) && Number.isFinite(Number(m.month));
    const inRangeByMonth = hasExplicitMonth && expenseMonthIndex >= startMonthIndex && expenseMonthIndex <= endMonthIndex;
    const inRangeByCreatedAt = !hasExplicitMonth && createdAt && createdAt >= startDate && createdAt <= endDate;

    if (!inRangeByMonth && !inRangeByCreatedAt) return;

    const amount = Number(m.amount || 0);
    monthlyExpense += amount;

    addOutflow(
      `monthly-${m.id}`,
      createdAt || monthStart,
      "Monthly Overhead",
      m.label || m.category,
      null,
      "Cash",
      amount
    );
  });

  // Sort activity
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // ── Final Return ────────────────────────────────────────────────────────
  return {
    // Cashflow
    totalIn,
    totalOut,
    net: totalIn - totalOut,
    bankIn: totalIn - cashIn,
    cashInHand: totalIn - totalOut - (totalIn - cashIn),
    byMethod,
    activity,

    // Unified Finance (used by all pages)
    grossRevenue,                    // Bookings (by status rule) + received addons
    totalCosts: totalOut,            // Vendor + Standard + Daily + Monthly
    netProfit: grossRevenue - totalOut,
    addonCommission,

    monthlyExpense,
    dailyExpense,

    // Beverages
    pepsiCrates,
    cokeCrates,
    pepsiPaid,
    cokePaid,
  };
}

module.exports = { computeCashflowSummary };