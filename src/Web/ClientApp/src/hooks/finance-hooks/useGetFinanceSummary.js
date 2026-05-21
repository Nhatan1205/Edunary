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

const useGetFinanceSummary = (from = null, to = null) => {
  return useQuery({
    queryKey: ["finance-summary", from, to],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getSummary(normalizeDateInput(from), normalizeDateInput(to));
    },
    keepPreviousData: true,
  });
};

export default useGetFinanceSummary;
