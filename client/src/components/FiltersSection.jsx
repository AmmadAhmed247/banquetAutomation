import { Search } from "lucide-react";

export default function FiltersSection({ search, onSearchChange, filter, onFilterChange, filteredCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="relative w-full sm:flex-1 sm:max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search client or event..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-green-200 rounded-xl text-green-900 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

      <div className="flex items-center justify-between gap-3 sm:contents">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0 sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["All", "Confirmed", "Pending", "Cancelled"].map(f2 => (
            <button
              key={f2}
              onClick={() => onFilterChange(f2)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer ${
                filter === f2
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-green-600 border-green-200 hover:border-green-400"
              }`}
            >
              {f2}
            </button>
          ))}
        </div>

        <span className="shrink-0 sm:ml-auto text-xs text-green-400 font-medium whitespace-nowrap">
          {filteredCount} bookings
        </span>
      </div>
    </div>
  );
}