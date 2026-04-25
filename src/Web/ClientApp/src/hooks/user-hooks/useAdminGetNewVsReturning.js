import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

/**
 * Fetches new vs returning users grouped by month for the given year.
 * Re-fetches whenever `year` changes.
 */
const useAdminGetNewVsReturning = (year = new Date().getFullYear()) => {
    return useQuery({
        queryKey: ["admin-new-vs-returning", year],
        queryFn: async () => {
            const client = new UserClient();
            const result = await client.adminGetNewVsReturning(year);
            if (!result) throw new Error("Failed to fetch new vs returning data");
            return result;
        },
        staleTime: 60 * 1000,
        keepPreviousData: true,
    });
};

export default useAdminGetNewVsReturning;
