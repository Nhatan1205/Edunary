import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

const useAdminGetUsers = (searchText, roleFilter, statusFilter, sortBy, pageNumber, pageSize) => {
    return useQuery({
        queryKey: ["admin-users", searchText, roleFilter, statusFilter, sortBy, pageNumber, pageSize],
        queryFn: async () => {
            const client = new UserClient();

            const result = await client.adminGetUsers(
                searchText || null,
                roleFilter || null,
                statusFilter || null,
                sortBy || "newest",
                pageNumber,
                pageSize
            );

            if (!result) throw new Error("Failed to fetch users");

            return {
                items: result.items ?? [],
                pageNumber: result.pageNumber,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                hasPreviousPage: result.hasPreviousPage,
                hasNextPage: result.hasNextPage,
            };
        },
        // Giữ data cũ trong khi fetch trang mới (tránh flash trống khi chuyển trang)
        placeholderData: keepPreviousData,
    });
};

export default useAdminGetUsers;
