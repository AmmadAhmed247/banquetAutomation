import { useQuery } from "@tanstack/react-query";
import bookingService from "../../services/booking.service";

export const getAllBookings = () => {
    return useQuery({
        queryKey: ['bookings'],
        queryFn: async () => await bookingService.getAllBookings(),
        staleTime: 1000 * 60 * 1
    })
}