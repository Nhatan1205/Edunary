import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

/**
 * Fetches user registration trend data for the Area chart.
 * Re-fetches whenever `range` changes ("7d" | "30d" | "3m" | "12m").
 */
const useAdminGetRegistrationTrend = (range = "30d") => {
    return useQuery({
        queryKey: ["admin-registration-trend", range],
        queryFn: async () => {
            const client = new UserClient();
            const result = await client.adminGetRegistrationTrend(range);
            if (!result) throw new Error("Failed to fetch registration trend");
            return result;
        },
        staleTime: 60 * 1000,
        keepPreviousData: true,  // keep old chart visible while loading new range
    });
};

export default useAdminGetRegistrationTrend;
