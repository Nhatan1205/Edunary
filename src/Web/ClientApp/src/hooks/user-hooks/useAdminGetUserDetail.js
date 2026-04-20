import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

const useAdminGetUserDetail = (userId) => {
    return useQuery({
        queryKey: ["admin-user-detail", userId],
        queryFn: async () => {
            const client = new UserClient();
            return await client.adminGetUserDetail(userId);
        },
        enabled: !!userId,
    });
};

export default useAdminGetUserDetail;
