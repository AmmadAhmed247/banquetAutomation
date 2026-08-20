import { useQuery } from "@tanstack/react-query";
import paymentService from "../../services/payment.service";

export function getAllPayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await paymentService.getAll();

      // handle every possible response shape
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.payments)) return res.payments;
      if (Array.isArray(res?.data?.data)) return res.data.data;

      return [];
    },
  });
}