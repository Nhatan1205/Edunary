import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useRunPayoutBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const client = new AdminFinanceClient();
      return await client.runPayoutBatch();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["finance-eligible-payouts"]);
      queryClient.invalidateQueries(["admin-withdrawal-requests"]);
      queryClient.invalidateQueries(["admin-withdrawal-request-status-counts"]);
    },
  });
};

export default useRunPayoutBatch;
