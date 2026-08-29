import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import bookingService from "../../services/booking.service";

export const getAllBookings = () => {
    return useQuery({
        queryKey: ['bookings'],
        queryFn: async () => await bookingService.getAllBookings(),
        staleTime: 1000 * 60 * 1
    })
}

export const useAddBookingNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, note, overwrite }) =>
      await bookingService.submitNote({ bookingId, note, overwrite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};