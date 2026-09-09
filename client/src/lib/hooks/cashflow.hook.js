// hooks/cashflow.hook.js  (or finance.hook.js)

import { useQuery } from "@tanstack/react-query";
import api from "../../api/api.js";

const financeService = {
  getSummary: async ({ start, end, range }) => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    if (range) params.append("range", range);

    const res = await api.get(`/api/cashflow?${params.toString()}`);
    return res.data?.data || {};
  },
};

export function useFinanceSummary({ start = "", end = "", range = "all" } = {}) {
  return useQuery({
    queryKey: ["finance-summary", { start, end, range }],
    queryFn: () => financeService.getSummary({ start, end, range }),
    keepPreviousData: true,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Keep old name for backward compatibility (optional)
export const useGetCashflow = useFinanceSummary;