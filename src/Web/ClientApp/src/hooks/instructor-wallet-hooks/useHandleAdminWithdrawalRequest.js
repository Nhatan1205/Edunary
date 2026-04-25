import { useMutation, useQueryClient } from "@tanstack/react-query";

const useHandleAdminWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action }) => {
      const normalizedAction = action === "cancel" ? "cancel" : "approve";

      const response = await fetch(`/api/InstructorWallet/withdrawals/${requestId}/${normalizedAction}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = payload?.message || payload?.toString() || "Failed to process withdrawal request.";
        throw new Error(message);
      }

      return payload;
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
