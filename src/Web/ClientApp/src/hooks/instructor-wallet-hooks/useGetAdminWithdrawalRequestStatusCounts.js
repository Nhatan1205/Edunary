import { useQuery } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const useGetAdminWithdrawalRequestStatusCounts = () => {
  return useQuery({
    queryKey: ["admin-withdrawal-request-status-counts"],
    queryFn: async () => {
      const client = new InstructorWalletClient();
      return await client.getAdminWithdrawalRequestStatusCounts();
    },
    staleTime: 60 * 1000,
  });
};

export default useGetAdminWithdrawalRequestStatusCounts;
