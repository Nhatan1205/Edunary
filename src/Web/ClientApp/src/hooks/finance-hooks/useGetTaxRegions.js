import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetTaxRegions = () => {
  return useQuery({
    queryKey: ["finance-tax-regions"],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getTaxRegions();
    },
  });
};

export default useGetTaxRegions;
