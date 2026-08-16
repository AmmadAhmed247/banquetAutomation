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
    onError: (err) => {
      console.error("Addon create failed:", err?.response?.data || err.message);
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

export function useMarkAddonReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_method, bank_name }) => addonService.markReceived(id, { payment_method, bank_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
  });
}
export function useUpdateAddon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => addonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
    onError: (err) => {
      console.error("Addon update failed:", err?.response?.data || err.message);
    },
  });
}