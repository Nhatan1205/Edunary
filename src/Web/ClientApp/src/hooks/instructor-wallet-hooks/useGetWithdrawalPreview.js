import { useQuery } from "@tanstack/react-query";

export const withdrawalPreviewQueryKey = (amount, currency = "USD") => [
  "withdrawal-preview",
  amount,
  currency,
];

export const fetchWithdrawalPreview = async ({ amount, currency = "USD", signal }) => {
  const response = await fetch("/api/InstructorWallet/withdraw/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ amount, currency }),
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to preview withdrawal.");
  }

  return response.json();
};

const useGetWithdrawalPreview = ({ amount, currency = "USD", enabled = true } = {}) => {
  const numericAmount = amount == null || amount === "" ? null : Number(amount);
  const queryAmount = Number.isFinite(numericAmount) ? numericAmount : null;
  const canFetch = enabled && queryAmount != null && queryAmount > 0;

  return useQuery({
    queryKey: withdrawalPreviewQueryKey(queryAmount, currency),
    queryFn: ({ signal }) => {
      if (queryAmount == null) {
        throw new Error("Withdrawal amount is required.");
      }

      return fetchWithdrawalPreview({ amount: queryAmount, currency, signal });
    },
    enabled: canFetch,
  });
};

export default useGetWithdrawalPreview;
