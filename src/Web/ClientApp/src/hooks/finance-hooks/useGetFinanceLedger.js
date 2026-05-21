import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const normalizeDateInput = (value) => {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const useGetFinanceLedger = (pageNumber = 1, pageSize = 20, filters = {}) => {
  const { accountCode, userId, from, to, transactionType } = filters;

  return useQuery({
    queryKey: ["finance-ledger", pageNumber, pageSize, accountCode, userId, from, to, transactionType],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getLedger(
        pageNumber,
        pageSize,
        accountCode || null,
        userId || null,
        normalizeDateInput(from),
        normalizeDateInput(to),
        transactionType === undefined || transactionType === null ? null : transactionType
      );
    },
    keepPreviousData: true,
  });
};

export default useGetFinanceLedger;
