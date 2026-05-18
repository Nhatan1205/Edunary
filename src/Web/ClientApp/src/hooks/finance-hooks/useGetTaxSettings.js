import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetTaxSettings = () => {
  return useQuery({
    queryKey: ["admin-finance-tax-settings"],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getTaxSettings();
    },
  });
};

export default useGetTaxSettings;
