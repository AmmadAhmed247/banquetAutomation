import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dailyExpenseService from "../../services/dailyExpense.service";

export const getAllDailyExpenses = () => {
    return useQuery({
        queryKey: ['dailyExpenses'],
        queryFn: async () => await dailyExpenseService.getAll(),
        staleTime: 1000 * 60 * 1
    });
};

export const useCreateDailyExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => await dailyExpenseService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['dailyExpenses']);
        }
    });
};

export const useDeleteDailyExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => await dailyExpenseService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['dailyExpenses']);
        }
    });
};