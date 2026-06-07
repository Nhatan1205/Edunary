import { useQuery } from "@tanstack/react-query";
import { AdminDashboardClient } from "../../web-api-client.ts";

/**
 * Fetches enrollment + revenue trend data.
 * Re-fetches when range changes (7d / 30d / 12m).
 */
const useGetAdminDashboardTrend = (range = "30d") => {
    return useQuery({
        queryKey: ["admin-dashboard-trend", range],
        queryFn: async () => {
            const client = new AdminDashboardClient();
            return await client.getDashboardTrend(range);
        },
        staleTime: 60 * 1000,
    });
};

export default useGetAdminDashboardTrend;
