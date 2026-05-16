import { useQuery } from "@tanstack/react-query";

const useGetFinanceLedger = (pageNumber = 1, pageSize = 20, filters = {}) => {
  const { accountCode, userId, from, to, transactionType } = filters;

  return useQuery({
    queryKey: ["finance-ledger", pageNumber, pageSize, accountCode, userId, from, to, transactionType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("PageNumber", String(pageNumber));
      params.set("PageSize", String(pageSize));
      if (accountCode) params.set("AccountCode", accountCode);
      if (userId) params.set("UserId", userId);
      if (from) params.set("From", new Date(from).toISOString());
      if (to) params.set("To", new Date(to).toISOString());
      if (transactionType !== undefined && transactionType !== null)
        params.set("TransactionType", String(transactionType));

      const response = await fetch(`/api/AdminFinance/ledger?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch ledger entries");
      return response.json();
    },
    keepPreviousData: true,
  });
};

export default useGetFinanceLedger;
