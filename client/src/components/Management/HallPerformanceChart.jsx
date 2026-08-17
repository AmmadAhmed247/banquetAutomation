import { Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { currency, compactCurrency } from "./ManagementUtils";
import { EventRow } from "./ManagementRows";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-4 py-3 text-[12px]">
      <p className="font-semibold text-stone-800 mb-2">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-stone-500">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />{p.name}
            </span>
            <span className="font-semibold text-stone-800">{currency(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HallPerformanceChart({ hallMonthlyData, upcomingEvents }) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 mb-8">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-[15px] font-bold text-stone-900 mb-6">Hall Performance</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hallMonthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="#F1F1EF" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#FAFAF9" }} />
            <Legend verticalAlign="top" align="right" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#78716C" }} />
            <Bar dataKey="Hall A" fill="#336bcc" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Hall B" fill="#c75638" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-bold text-stone-900">Upcoming Events</p>
          <div className="bg-stone-50 p-1.5 rounded-lg"><Calendar size={13} className="text-stone-400" /></div>
        </div>
        <div className="space-y-1">{upcomingEvents.map(b => <EventRow key={b.id} booking={b} />)}</div>
      </div>
    </div>
  );
}