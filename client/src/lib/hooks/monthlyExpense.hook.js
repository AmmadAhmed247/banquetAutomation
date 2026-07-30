import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import monthlyExpenseService from "../../services/monthlyexpense.service";

export function getAllMonthlyExpenses() {
  return useQuery({
    queryKey: ["monthlyExpenses"],
    queryFn: async () => {
      const res = await monthlyExpenseService.getAll();
      return res.monthlyExpenses || [];
    },
  });
}

export function useCreateMonthlyExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => monthlyExpenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthlyExpenses"] });
    },
  });
}

export function useDeleteMonthlyExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => monthlyExpenseService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthlyExpenses"] });
    },
  });
}