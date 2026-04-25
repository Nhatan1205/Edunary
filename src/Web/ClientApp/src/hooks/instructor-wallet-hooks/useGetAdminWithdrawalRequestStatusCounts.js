import { useQuery } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const useGetAdminWithdrawalRequestStatusCounts = () => {
  return useQuery({
    queryKey: ["admin-withdrawal-request-status-counts"],
    queryFn: async () => {
      const client = new InstructorWalletClient();
      const result = await client.getAdminWithdrawalRequestStatusCounts();
      if (!result) throw new Error("Failed to fetch withdrawal request status counts");
      return result;
    },
    staleTime: 60 * 1000,
  });
};

export default useGetAdminWithdrawalRequestStatusCounts;
