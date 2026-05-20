import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetPayoutSettings = () => {
  return useQuery({
    queryKey: ["admin-finance-payout-settings"],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getPayoutSettings();
    },
  });
};

export default useGetPayoutSettings;
