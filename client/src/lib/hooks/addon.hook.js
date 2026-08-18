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
    mutationFn: ({ id, ...payload }) => addonService.markReceived(id, payload),
    
    // When mutation is triggered, update the UI cache instantly before the server even responds
    onMutate: async ({ id, received }) => {
      await queryClient.cancelQueries({ queryKey: ["addons"] });

      const previousAddons = queryClient.getQueryData(["addons"]);

      queryClient.setQueryData(["addons"], (old = []) =>
        old.map((addon) =>
          addon.id === id ? { ...addon, received: received ?? true } : addon
        )
      );

      return { previousAddons };
    },
    
    // If it fails, roll back
    onError: (err, variables, context) => {
      if (context?.previousAddons) {
        queryClient.setQueryData(["addons"], context.previousAddons);
      }
    },
    
    // Always refetch after error or success to ensure sync
    onSettled: () => {
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