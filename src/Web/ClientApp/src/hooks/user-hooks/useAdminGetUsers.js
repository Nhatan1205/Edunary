import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

/**
 * Hook lấy danh sách users cho admin (có filter, sort, pagination).
 *
 * @param {string}   searchText   - Tìm theo tên hoặc email
 * @param {string}   roleFilter   - "User" | "Administrator" | null
 * @param {string}   statusFilter - "Active" | "Inactive" | "Suspended" | "Banned" | null
 * @param {string}   sortBy       - "name" | "lastLogin" | "newest"
 * @param {number}   pageNumber   - 1-indexed (MUI TablePagination dùng 0-indexed, phải +1 khi truyền vào)
 * @param {number}   pageSize     - Số items mỗi trang
 */
const useAdminGetUsers = (searchText, roleFilter, statusFilter, sortBy, pageNumber, pageSize) => {
    return useQuery({
        queryKey: ["admin-users", searchText, roleFilter, statusFilter, sortBy, pageNumber, pageSize],
        queryFn: async () => {
            const client = new UserClient();

            // Gọi endpoint GET /api/User/admin với các params filter/sort/paginate
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
