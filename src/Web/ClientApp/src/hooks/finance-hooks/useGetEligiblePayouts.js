import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetEligiblePayouts = () => {
  return useQuery({
    queryKey: ["finance-eligible-payouts"],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getEligiblePayouts();
    },
  });
};

export default useGetEligiblePayouts;
