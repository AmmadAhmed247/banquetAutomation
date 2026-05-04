import { Search } from "lucide-react";

export default function FiltersSection({ search, onSearchChange, filter, onFilterChange, filteredCount }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search client or event..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-green-200 rounded-xl text-green-900 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>
      <div className="flex gap-2">
        {["All", "Confirmed", "Pending", "Cancelled"].map(f2 => (
          <button
            key={f2}
            onClick={() => onFilterChange(f2)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer ${
              filter === f2
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-green-600 border-green-200 hover:border-green-400"
            }`}
          >
            {f2}
          </button>
        ))}
      </div>
      <span className="ml-auto text-xs text-green-400 font-medium">{filteredCount} bookings</span>
    </div>
  );
}
