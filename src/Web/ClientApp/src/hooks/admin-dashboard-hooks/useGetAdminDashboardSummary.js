import { useQuery } from "@tanstack/react-query";
import { AdminDashboardClient } from "../../web-api-client.ts";

const useGetAdminDashboardSummary = () => {
    return useQuery({
        queryKey: ["admin-dashboard-summary"],
        queryFn: async () => {
            const client = new AdminDashboardClient();
            return await client.getDashboardSummary();
        },
        staleTime: 60 * 1000,
    });
};

export default useGetAdminDashboardSummary;
