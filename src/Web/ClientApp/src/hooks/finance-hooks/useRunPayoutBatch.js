import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRunPayoutBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/AdminFinance/payouts/run-batch", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to run payout batch");
      }
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["finance-eligible-payouts"]);
      queryClient.invalidateQueries(["admin-withdrawal-requests"]);
      queryClient.invalidateQueries(["admin-withdrawal-request-status-counts"]);
    },
  });
};

export default useRunPayoutBatch;
