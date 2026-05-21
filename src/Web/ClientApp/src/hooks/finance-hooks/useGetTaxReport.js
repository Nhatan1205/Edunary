import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetTaxReport = (period = null) => {
  return useQuery({
    queryKey: ["finance-tax-report", period],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getTaxReport(period == null || period === "" ? null : period);
    },
  });
};

export default useGetTaxReport;
