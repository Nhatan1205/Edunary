import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

/**
 * Hook lấy số lượng users theo từng status — dùng cho Status Tabs badges.
 *
 * Đặc điểm quan trọng:
 * - KHÔNG bị ảnh hưởng bởi search/filter — luôn trả về count toàn bộ DB
 * - staleTime cao (60s) vì data này hiếm khi thay đổi
 * - Chỉ invalidate khi ban/unban/add user
 */
const useAdminGetUserStatusCounts = () => {
    return useQuery({
        queryKey: ["admin-user-status-counts"],
        queryFn: async () => {
            const client = new UserClient();
            const result = await client.adminGetUserStatusCounts();
            if (!result) throw new Error("Failed to fetch user status counts");
            return result;
        },
        // Giữ cache 60 giây — count không thay đổi theo từng keystroke
        staleTime: 60 * 1000,
    });
};

export default useAdminGetUserStatusCounts;
