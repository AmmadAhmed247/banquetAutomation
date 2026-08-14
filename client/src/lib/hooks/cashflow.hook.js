import { useQuery } from "@tanstack/react-query";
import api from "../../api/api.js"; // or your configured API instance

const cashflowService = {
  getCashflow: async ({ start, end }) => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const res = await api.get(`/api/cashflow?${params.toString()}`);
    return res.data?.data || { totalIn: 0, totalOut: 0, net: 0, byMethod: {}, activity: [] };
  },
};

export function useGetCashflow({ start, end, range }) {
  return useQuery({
    queryKey: ["cashflow", { start, end, range }],
    queryFn: () => cashflowService.getCashflow({ start, end }),
    keepPreviousData: true,
  });
}