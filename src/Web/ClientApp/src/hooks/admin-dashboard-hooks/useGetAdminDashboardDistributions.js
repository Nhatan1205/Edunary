import { useQuery } from "@tanstack/react-query";
import { AdminDashboardClient } from "../../web-api-client.ts";

/**
 * Fetches static distribution data: category, topic enrollments, top courses.
 * No filter — fetched once on mount, cached.
 */
const useGetAdminDashboardDistributions = () => {
    return useQuery({
        queryKey: ["admin-dashboard-distributions"],
        queryFn: async () => {
            const client = new AdminDashboardClient();
            return await client.getDashboardDistributions();
        },
        staleTime: 60 * 1000,
    });
};

export default useGetAdminDashboardDistributions;
