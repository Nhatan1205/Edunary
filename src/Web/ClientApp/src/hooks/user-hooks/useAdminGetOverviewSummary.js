import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

/**
 * Fetches stat cards + status distribution + top active users.
 * No params — fetched once on mount, long cache since data rarely changes.
 * Invalidate on: add/ban/unban user.
 */
const useAdminGetOverviewSummary = () => {
    return useQuery({
        queryKey: ["admin-overview-summary"],
        queryFn: async () => {
            const client = new UserClient();
            const result = await client.adminGetOverviewSummary();
            if (!result) throw new Error("Failed to fetch overview summary");
            return result;
        },
        staleTime: 60 * 1000,
    });
};

export default useAdminGetOverviewSummary;
