import { useMemo } from "react";
import { MONTHS, normalizeBooking, daysUntil, pct } from "./ManagementUtils";

export function useManagementData({
  rawBookings,
  expenses,
  addons,
  allMonthlyExpenses,
  allDailyExpenses,
  selectedYear,
  selectedMonth,
  hallFilter,
  ledgerSearch,
  ledgerPage,
  ledgerPerPage,
  selectedBookingId,
}) {
  const bookings = useMemo(() => rawBookings.map(normalizeBooking), [rawBookings]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    const d = new Date(b.date);
    return d.getFullYear() === selectedYear
      && (selectedMonth === null || d.getMonth() === selectedMonth)
      && (hallFilter === "all" || b.hall === hallFilter);
  }), [bookings, selectedYear, selectedMonth, hallFilter]);

  const ledgerFilteredBookings = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    const res = q
      ? filteredBookings.filter(b =>
          (b.client || "").toLowerCase().includes(q) ||
          (b.event || "").toLowerCase().includes(q) ||
          (b.hall || "").toLowerCase().includes(q))
      : filteredBookings;
    return [...res].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredBookings, ledgerSearch]);

  const displayedLedgerBookings = useMemo(() =>
    ledgerSearch.trim()
      ? ledgerFilteredBookings
      : ledgerFilteredBookings.slice((ledgerPage - 1) * ledgerPerPage, ledgerPage * ledgerPerPage),
  [ledgerFilteredBookings, ledgerPage, ledgerPerPage, ledgerSearch]);

  const ledgerTotalPages = Math.max(1, Math.ceil(ledgerFilteredBookings.length / ledgerPerPage));

  const expensesByBooking = useMemo(() => {
    const map = {};
    expenses.forEach(e => { if (!map[e.bookingId]) map[e.bookingId] = []; map[e.bookingId].push(e); });
    return map;
  }, [expenses]);

  const addonsByBooking = useMemo(() => {
    const map = {};
    addons.forEach(a => { if (!map[a.bookingId]) map[a.bookingId] = []; map[a.bookingId].push(a); });
    return map;
  }, [addons]);

  const totalRevenue = useMemo(() => {
    const bRev = filteredBookings.reduce((s, b) => s + b.revenue, 0);
    const aRev = filteredBookings.reduce((s, b) =>
      s + (addonsByBooking[b.id] || []).reduce((acc, a) => acc + (a.received ? Number(a.client_price) : 0), 0), 0);
    return bRev + aRev;
  }, [filteredBookings, addonsByBooking]);

  const totalExpense = useMemo(() => {
    const std = filteredBookings.reduce((s, b) =>
      s + (expensesByBooking[b.id] || []).reduce((acc, e) => acc + Number(e.amount), 0), 0);
    const vend = filteredBookings.reduce((s, b) =>
      s + (addonsByBooking[b.id] || []).reduce((acc, a) => acc + (a.received ? Number(a.vendor_cost) : 0), 0), 0);
    const month = allMonthlyExpenses
      .filter(me => me.year === selectedYear && (selectedMonth === null || (me.month - 1) === selectedMonth))
      .reduce((s, me) => s + Number(me.amount), 0);
    const daily = allDailyExpenses
      .filter(de => { const d = new Date(de.date); return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth); })
      .reduce((s, de) => s + Number(de.amount), 0);
    return std + vend + month + daily;
  }, [filteredBookings, expensesByBooking, addonsByBooking, allMonthlyExpenses, allDailyExpenses, selectedYear, selectedMonth]);

  const totalProfit = totalRevenue - totalExpense;
  const margin = pct(totalProfit, totalRevenue);

  const totalAddonCommission = useMemo(() =>
    filteredBookings.reduce((s, b) =>
      s + (addonsByBooking[b.id] || []).reduce((acc, a) =>
        a.received ? acc + (Number(a.client_price) - Number(a.vendor_cost)) : acc, 0), 0),
  [filteredBookings, addonsByBooking]);

  const hallMonthlyData = useMemo(() => MONTHS.map((m, idx) => {
    const forHall = (hall) => bookings.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === selectedYear && d.getMonth() === idx && b.hall === hall;
    }).reduce((s, b) => s + b.revenue + (addonsByBooking[b.id] || []).reduce((acc, a) => acc + (a.received ? Number(a.client_price) : 0), 0), 0);
    return { month: m, "Hall A": forHall("Hall A"), "Hall B": forHall("Hall B") };
  }), [bookings, selectedYear, addonsByBooking]);

  const upcomingEvents = useMemo(() =>
  [...bookings]
    .filter(b => daysUntil(b.date) >= 0 && b.status !== 'Cancelled' && b.status !== 'Pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5),
[bookings]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const selAddons = selectedBookingId ? (addonsByBooking[selectedBookingId] || []) : [];
  const selExp = selectedBookingId ? (expensesByBooking[selectedBookingId] || []) : [];
  const selGrossRev = (selectedBooking?.revenue || 0) + selAddons.reduce((s, a) => s + (a.received ? Number(a.client_price) : 0), 0);
  const selGrossExp = selExp.reduce((s, e) => s + Number(e.amount), 0) + selAddons.reduce((s, a) => s + (a.received ? Number(a.vendor_cost) : 0), 0);

  return {
    bookings,
    filteredBookings,
    ledgerFilteredBookings,
    displayedLedgerBookings,
    ledgerTotalPages,
    expensesByBooking,
    addonsByBooking,
    totalRevenue,
    totalExpense,
    totalProfit,
    margin,
    totalAddonCommission,
    hallMonthlyData,
    upcomingEvents,
    selectedBooking,
    selAddons,
    selExp,
    selGrossRev,
    selGrossExp,
  };
}