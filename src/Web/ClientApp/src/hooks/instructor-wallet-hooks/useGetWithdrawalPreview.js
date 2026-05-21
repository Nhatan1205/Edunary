import { useQuery } from "@tanstack/react-query";
import { GetWithdrawalPreviewQuery, InstructorWalletClient } from "../../web-api-client.ts";

export const withdrawalPreviewQueryKey = (amount, currency = "USD") => [
  "withdrawal-preview",
  amount,
  currency,
];

export const fetchWithdrawalPreview = async ({ amount, currency = "USD", signal }) => {
  const client = new InstructorWalletClient(
    undefined,
    signal
      ? {
          fetch: (url, init) => fetch(url, { ...init, signal }),
        }
      : undefined
  );

  return await client.getWithdrawalPreview(new GetWithdrawalPreviewQuery({ amount, currency }));
};

const useGetWithdrawalPreview = ({ amount, currency = "USD", enabled = true } = {}) => {
  const numericAmount = amount == null || amount === "" ? null : Number(amount);
  const queryAmount = Number.isFinite(numericAmount) ? numericAmount : null;
  const canFetch = enabled && queryAmount != null && queryAmount > 0;

  return useQuery({
    queryKey: withdrawalPreviewQueryKey(queryAmount, currency),
    queryFn: ({ signal }) => {
      if (queryAmount == null) {
        return null;
      }

      return fetchWithdrawalPreview({ amount: queryAmount, currency, signal });
    },
    enabled: canFetch,
  });
};

export default useGetWithdrawalPreview;
