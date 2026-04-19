import { NAV } from "../data/mockData";

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="w-60 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-7 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">R</div>
          <span className="text-2xl font-bold text-white tracking-tight font-serif">ReachBot</span>
        </div>
        <p className="text-slate-500 text-xs pl-12">Wedding CRM Studio</p>
      </div>

      <div className="h-px bg-slate-800 mx-4" />

      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              active === n.id
                ? "bg-emerald-900/50 text-emerald-400"
                : "hover:bg-slate-900"
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge && (
              <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-2xl">
          <div className="w-9 h-9 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400 font-bold">SA</div>
          <div>
            <p className="text-sm font-semibold text-white">Studio Admin</p>
            <p className="text-xs text-slate-500">admin@studio.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}