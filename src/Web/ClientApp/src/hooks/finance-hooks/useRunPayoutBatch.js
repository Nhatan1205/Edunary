import { useMutation } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useRunPayoutBatch = () => {

  return useMutation({
    mutationFn: async () => {
      const client = new AdminFinanceClient();
      return await client.runPayoutBatch();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-eligible-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-request-status-counts"] });
    },
  });
};

export default useRunPayoutBatch;
