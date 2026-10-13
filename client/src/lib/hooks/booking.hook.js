import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import bookingService from "../../services/booking.service";

function showBookingError(error, fallbackMessage) {
    const message =
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage;
    toast.error(message);
}

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

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form) => await bookingService.createBooking(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      showBookingError(error, "Failed to create booking. Please try again.");
    },
  });
};


export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form) => await bookingService.updateBooking(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      showBookingError(error, "Failed to update booking. Please try again.");
    },
  });
};