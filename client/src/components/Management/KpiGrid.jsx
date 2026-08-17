import { ArrowUpRight, Receipt, DollarSign, PlusCircle } from "lucide-react";
import { currency } from "./ManagementUtils";
import { KpiCard } from "./ManagementRows";

export function KpiGrid({ totalRevenue, totalExpense, totalProfit, margin, totalAddonCommission }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KpiCard label="Gross Revenue" value={currency(totalRevenue)} sub="Incl. received add-ons" icon={ArrowUpRight} />
      <KpiCard label="Total Costs" value={currency(totalExpense)} sub="Std + Received Vendor + Overhead" icon={Receipt} />
      <KpiCard label="Net Profit" value={currency(totalProfit)} sub={totalProfit >= 0 ? "Total take-home" : "Loss"} icon={DollarSign} trend={margin} />
      <KpiCard label="Add-on Commission" value={currency(totalAddonCommission)} sub="From received services" icon={PlusCircle} />
    </div>
  );
}