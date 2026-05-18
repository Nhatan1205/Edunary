import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InstructorWalletClient } from "../../web-api-client.ts";

const useHandleAdminWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action }) => {
      const normalizedAction = action === "cancel" ? "cancel" : "approve";
      const client = new InstructorWalletClient();
      return normalizedAction === "cancel"
        ? await client.cancelWithdrawal(requestId)
        : await client.approveWithdrawal(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-withdrawal-requests"]);
      queryClient.invalidateQueries(["admin-withdrawal-request-status-counts"]);
      queryClient.invalidateQueries(["instructor-wallet"]);
      queryClient.invalidateQueries(["instructor-wallet-transactions"]);
    },
  });
};

export default useHandleAdminWithdrawalRequest;
