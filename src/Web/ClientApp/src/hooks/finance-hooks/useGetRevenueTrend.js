import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const useGetRevenueTrend = (range = "30d") => {
  return useQuery({
    queryKey: ["finance-revenue-trend", range],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getRevenueTrend(range);
    },
    staleTime: 60 * 1000,
    keepPreviousData: true,
  });
};

export default useGetRevenueTrend;
