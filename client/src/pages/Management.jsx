import { useState } from "react";

// Hooks
import { getAllBookings } from "../lib/hooks/booking.hook";
import { getAllExpenses, useCreateExpense, useDeleteExpense } from "../lib/hooks/expense.hook";
import { getAllAddons, useCreateAddon, useDeleteAddon, useMarkAddonReceived, useUpdateAddon } from "../lib/hooks/addon.hook";
import { getAllMonthlyExpenses, useCreateMonthlyExpense, useDeleteMonthlyExpense } from "../lib/hooks/monthlyExpense.hook";
import { getAllDailyExpenses, useCreateDailyExpense, useDeleteDailyExpense } from "../lib/hooks/dailyExpense.hook";

// Utils & data hook
import { CURRENT_YEAR, STANDARD_EXPENSE_CATEGORIES, MONTHLY_EXPENSE_CATEGORIES, DAILY_EXPENSE_CATEGORIES, ADDON_CATEGORIES, getPKTDateISO } from "../components/Management/ManagementUtils.js";
import { useManagementData } from "../components/management/useManagementData";

// Section components
import { ManagementHeader } from "../components/management/ManagementHeader";
import { KpiGrid } from "../components/management/KpiGrid";
import { HallPerformanceChart } from "../components/management/HallPerformanceChart";
import { BookingLedger } from "../components/management/BookingLedger";
import { MonthlyOverheadPanel } from "../components/management/Monthlyoverheadpanel";
import { DailyExpensesPanel } from "../components/management/DailyExpensesPanel";
import { BookingInspector } from "../components/management/BookingInspector";

export default function Management() {
  // ── Raw data ──
  const { data: rawExpenses } = getAllExpenses() || {};
  const expenses = Array.isArray(rawExpenses) ? rawExpenses : (rawExpenses?.data || []);
  const { data: rawAddons } = getAllAddons() || {};
  const addons = Array.isArray(rawAddons) ? rawAddons : (rawAddons?.data || []);
  const { data: rawMonthlyExpenses } = getAllMonthlyExpenses() || {};
  const allMonthlyExpenses = Array.isArray(rawMonthlyExpenses) ? rawMonthlyExpenses : (rawMonthlyExpenses?.data || []);
  const { data: rawDailyExpenses } = getAllDailyExpenses() || {};
  const allDailyExpenses = Array.isArray(rawDailyExpenses) ? rawDailyExpenses : (rawDailyExpenses?.data || []);
  const { data: rawBookings = [] } = getAllBookings() || {};

  // ── Mutations ──
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const createAddonMutation = useCreateAddon();
  const deleteAddonMutation = useDeleteAddon();
  const createMonthlyExpenseMutation = useCreateMonthlyExpense();
  const deleteMonthlyExpenseMutation = useDeleteMonthlyExpense();
  const createDailyExpenseMutation = useCreateDailyExpense();
  const deleteDailyExpenseMutation = useDeleteDailyExpense();
  const updateAddonMutation = useUpdateAddon();
  const markReceived = useMarkAddonReceived();

  // ── UI state ──
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [hallFilter, setHallFilter] = useState("all");
  const [addingMonthly, setAddingMonthly] = useState(false);
  const [addingDaily, setAddingDaily] = useState(false);
  const [addingTo, setAddingTo] = useState(null);
  const [mode, setMode] = useState("expense");

  const [newMonthly, setNewMonthly] = useState({ category: MONTHLY_EXPENSE_CATEGORIES[0], label: "", amount: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [newDaily, setNewDaily] = useState({ category: DAILY_EXPENSE_CATEGORIES[0], label: "", amount: "", date: getPKTDateISO() });
  const [newExp, setNewExp] = useState({ category: STANDARD_EXPENSE_CATEGORIES[0], label: "", amount: "" });
  const [newAddon, setNewAddon] = useState({ service: ADDON_CATEGORIES[0], client_price: "", vendor_cost: "", description: "" });

  const ledgerPerPage = 10;

  // ── All derived numbers live in this one hook — check here first if a total looks wrong ──
  const {
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
  } = useManagementData({
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
  });

  const handleMarkReceived = (id, method) => {
    const isBank = method !== "Cash" && method !== "JazzCash" && method !== "EasyPaisa";
    markReceived.mutate({ id, payment_method: isBank ? "Bank Transfer" : method, bank_name: isBank ? method : null });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-5 md:p-8 antialiased selection:bg-emerald-100 font-['Inter']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <ManagementHeader
        hallFilter={hallFilter}
        setHallFilter={setHallFilter}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      <KpiGrid
        totalRevenue={totalRevenue}
        totalExpense={totalExpense}
        totalProfit={totalProfit}
        margin={margin}
        totalAddonCommission={totalAddonCommission}
      />

      <HallPerformanceChart hallMonthlyData={hallMonthlyData} upcomingEvents={upcomingEvents} />

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <BookingLedger
          ledgerSearch={ledgerSearch}
          setLedgerSearch={setLedgerSearch}
          setLedgerPage={setLedgerPage}
          ledgerFilteredBookings={ledgerFilteredBookings}
          displayedLedgerBookings={displayedLedgerBookings}
          ledgerPage={ledgerPage}
          ledgerTotalPages={ledgerTotalPages}
          expensesByBooking={expensesByBooking}
          addonsByBooking={addonsByBooking}
          selectedBookingId={selectedBookingId}
          setSelectedBookingId={setSelectedBookingId}
          setAddingTo={setAddingTo}
        />

        <div className="flex flex-col gap-4">
          <MonthlyOverheadPanel
            allMonthlyExpenses={allMonthlyExpenses}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            addingMonthly={addingMonthly}
            setAddingMonthly={setAddingMonthly}
            newMonthly={newMonthly}
            setNewMonthly={setNewMonthly}
            createMonthlyExpenseMutation={createMonthlyExpenseMutation}
            deleteMonthlyExpenseMutation={deleteMonthlyExpenseMutation}
          />

          <DailyExpensesPanel
            allDailyExpenses={allDailyExpenses}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            addingDaily={addingDaily}
            setAddingDaily={setAddingDaily}
            newDaily={newDaily}
            setNewDaily={setNewDaily}
            createDailyExpenseMutation={createDailyExpenseMutation}
            deleteDailyExpenseMutation={deleteDailyExpenseMutation}
          />

          <BookingInspector
            selectedBookingId={selectedBookingId}
            setSelectedBookingId={setSelectedBookingId}
            selectedBooking={selectedBooking}
            selAddons={selAddons}
            selExp={selExp}
            selGrossRev={selGrossRev}
            selGrossExp={selGrossExp}
            deleteExpenseMutation={deleteExpenseMutation}
            deleteAddonMutation={deleteAddonMutation}
            updateAddonMutation={updateAddonMutation}
            handleMarkReceived={handleMarkReceived}
            addingTo={addingTo}
            setAddingTo={setAddingTo}
            mode={mode}
            setMode={setMode}
            newExp={newExp}
            setNewExp={setNewExp}
            newAddon={newAddon}
            setNewAddon={setNewAddon}
            createExpenseMutation={createExpenseMutation}
            createAddonMutation={createAddonMutation}
          />
        </div>
      </div>
    </div>
  );
}