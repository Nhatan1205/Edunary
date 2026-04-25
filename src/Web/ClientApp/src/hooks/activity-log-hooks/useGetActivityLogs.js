import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ActivityLogsClient } from "../../web-api-client.ts";

const useGetActivityLogs = ({
    userId = null,
    activityTypeFilter = -1,
    search = null,
    from = null,
    to = null,
    sortOrder = "newest",
    pageNumber = 1,
    pageSize = 10,
} = {}) => {
    return useQuery({
        queryKey: ["activity-logs", userId, activityTypeFilter, search, from, to, sortOrder, pageNumber, pageSize],
        queryFn: async () => {
            const client = new ActivityLogsClient();

            // from/to are required by the generated client — pass safe epoch defaults when not filtering
            const fromDate = from ? new Date(from) : new Date("1970-01-01T00:00:00Z");
            const toDate = to ? new Date(to) : new Date("2099-12-31T23:59:59Z");

            const result = await client.getActivityLogs(
                userId || null,
                activityTypeFilter,
                search || null,
                fromDate,
                toDate,
                sortOrder || "newest",
                pageNumber,
                pageSize
            );

            if (!result) throw new Error("Failed to fetch activity logs");

            return {
                items: result.items ?? [],
                totalCount: result.totalCount,
                pageNumber: result.pageNumber,
                totalPages: result.totalPages,
                hasPreviousPage: result.hasPreviousPage,
                hasNextPage: result.hasNextPage,
            };
        },
        placeholderData: keepPreviousData,
    });
};

export default useGetActivityLogs;
