import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import addonService from "../../services/addon.service";

export function getAllAddons() {
  return useQuery({
    queryKey: ["addons"],
    queryFn: async () => {
      const res = await addonService.getAll();
      return res.addons || [];
    },
  });
}

export function useCreateAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
}

export function useDeleteAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => addonService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
}