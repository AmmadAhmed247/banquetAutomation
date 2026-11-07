import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/api.js";

const cashDeskService = {
  settleIn: async (payload) => {
    const res = await api.post("/api/payments", {
      bookingId: payload.bookingId,
      amount: payload.amount,
      payment_method: payload.method,
      isFinished: payload.isFinished,
      note: "Advance received",
    });
    return res.data?.data || res.data;
  },
  settleOut: async (payload) => {
    const res = await api.post("/api/dailyExpense/createExpense", {
      date: payload.date,
      category: payload.category || "Petty Cash",
      label: payload.label || (payload.quantity > 1 ? `${payload.item} x ${payload.quantity}` : payload.item),
      amount: payload.amount,
    });
    return res.data?.data || res.data;
  },
};

// axios puts the server message in error.response.data.message
const withMessage = (err) => {
  const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
  return Object.assign(new Error(msg || "Request failed"), { original: err });
};

// After a settle, refetch everything so the summary, ledger and booking dues all refresh
export function useSettleMoneyIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => cashDeskService.settleIn(payload).catch((e) => { throw withMessage(e); }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSettleMoneyOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => cashDeskService.settleOut(payload).catch((e) => { throw withMessage(e); }),
    onSuccess: () => qc.invalidateQueries(),
  });
}