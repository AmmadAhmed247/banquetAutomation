export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const STANDARD_EXPENSE_CATEGORIES = ["Staff Wages", "Miscellaneous"];
export const MONTHLY_EXPENSE_CATEGORIES = ["Electric Bill", "Diesel" , "Sui Gas", "Water Bill", "Internet", "Rent", "Security Guard", "Miscellaneous"];
export const DAILY_EXPENSE_CATEGORIES = ["Kitchen/Tea", "Maintenance", "Petty Cash", "Office"];
export const ADDON_CATEGORIES = ["Pepsi Co.", "Coca Cola Co.", "Fresh Flower", "Cola Next", "Dance Floor", "Water Bottles", "Ayaz Tissue", "Stage", "Fire Crackers", "Ladies Staff", "Miscellaneous" , "BBQ" , "Sound System", "Entry" , "Decoration"];
export const ADDON_PAYMENT_METHODS = ["Cash", "JazzCash", "EasyPaisa", "Habib Metro Usman", "Meezan Bank Sadar"];
export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1];

export function currency(n) { return "₨ " + Number(n || 0).toLocaleString("en-PK"); }
export function compactCurrency(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000) return `₨${Math.round(v / 1000)}K`;
  return `₨${v}`;
}
export function pct(a, b) { if (!b) return 0; return Math.round((a / b) * 100); }

export function getPKTDateISO(dateInput = new Date()) {
  const parsed = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
}

export function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

export function getBookingRevenue(b) {
  const status = (b.status || "").toString().toLowerCase();
  const total = Number(b.total_amount ?? b.totalAmount ?? 0) || 0;
  const advance = Number(b.advance_paid ?? b.advancePaid ?? 0) || 0;
  if (status === "finished" || status === "completed") return total;
  if (["confirmed", "pending", "cancelled"].includes(status)) return advance;
  return 0;
}

export function normalizeBooking(b) {
  return { id: b.id, hall: b.venue, client: b.client, event: b.event, date: b.date, status: b.status, revenue: getBookingRevenue(b) };
}