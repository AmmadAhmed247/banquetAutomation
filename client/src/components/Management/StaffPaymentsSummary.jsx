import { useMemo, useState } from "react";
import { BadgeDollarSign, ChevronDown, ShieldCheck, UserRound, Users } from "lucide-react";
import { currency, STAFF_PAYMENT_CATEGORIES } from "./ManagementUtils.js";

function getPKTDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

const CATEGORY_STYLES = {
  "Security Guard": {
    icon: ShieldCheck,
    accent: "text-sky-700",
    iconBg: "bg-sky-100",
    border: "border-sky-100",
  },
  "Asif Sahib": {
    icon: UserRound,
    accent: "text-violet-700",
    iconBg: "bg-violet-100",
    border: "border-violet-100",
  },
  Munawwar: {
    icon: UserRound,
    accent: "text-emerald-700",
    iconBg: "bg-emerald-100",
    border: "border-emerald-100",
  },
  Asher: {
    icon: UserRound,
    accent: "text-amber-700",
    iconBg: "bg-amber-100",
    border: "border-amber-100",
  },
  "Junaid Driver": {
    icon: UserRound,
    accent: "text-zinc-700",
    iconBg: "bg-zinc-100",
    border: "border-zinc-100",
  },
};

export function StaffPaymentsSummary({ dailyExpenses, monthlyExpenses }) {
  const [period, setPeriod] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");

  const todayKey = getPKTDateKey(new Date());
  const [year, month] = todayKey.split("-").map(Number);
  const totals = useMemo(() => STAFF_PAYMENT_CATEGORIES
    .filter((category) => staffFilter === "all" || category === staffFilter)
    .map((category) => {
      const dailyEntries = dailyExpenses.filter((expense) => {
        if (expense.category?.trim().toLowerCase() !== category.toLowerCase()) return false;
        const dateKey = getPKTDateKey(expense.date);
        if (period === "today") return dateKey === todayKey;
        if (period === "month") return dateKey.startsWith(`${year}-${String(month).padStart(2, "0")}-`);
        return true;
      });
      const monthlyEntries = category === "Security Guard"
        ? monthlyExpenses.filter((expense) => {
            if (expense.category?.trim().toLowerCase() !== category.toLowerCase()) return false;
            if (period === "today") return getPKTDateKey(expense.created_at) === todayKey;
            if (period === "month") return Number(expense.year) === year && Number(expense.month) === month;
            return true;
          })
        : [];
      const entries = [...dailyEntries, ...monthlyEntries];

      return {
        category,
        total: entries.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
        count: entries.length,
      };
    }), [dailyExpenses, monthlyExpenses, period, staffFilter, todayKey, year, month]);
  const periodLabel = period === "today" ? "Today" : period === "month" ? "This month" : "All time";

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-stone-900">Staff & security payments</h2>
          <p className="mt-0.5 text-[11px] text-stone-400">{periodLabel} totals from recorded expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Filter staff member</span>
            <select
              value={staffFilter}
              onChange={(event) => setStaffFilter(event.target.value)}
              className="appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-[11px] font-medium text-stone-700 outline-none"
            >
              <option value="all">All staff</option>
              {STAFF_PAYMENT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter payment period</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-[11px] font-medium text-stone-700 outline-none"
            >
              <option value="today">Today</option>
              <option value="month">This month</option>
              <option value="all">All time</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </label>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <BadgeDollarSign size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {totals.map(({ category, total, count }) => {
          const style = CATEGORY_STYLES[category];
          const Icon = category === "Security Guard" ? style.icon : Users;

          return (
            <article
              key={category}
              className={`rounded-xl border ${style.border} bg-gradient-to-br from-white to-stone-50/70 p-3.5`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.accent}`}>
                    <Icon size={16} />
                  </span>
                  <h3 className="truncate text-[12px] font-semibold text-stone-700">{category}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-medium text-stone-500 ring-1 ring-stone-100">
                  {count} {count === 1 ? "payment" : "payments"}
                </span>
              </div>
              <p className={`mt-3 text-xl font-bold tracking-tight ${style.accent}`}>{currency(total)}</p>
              <p className="mt-0.5 text-[10px] text-stone-400">total paid</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
