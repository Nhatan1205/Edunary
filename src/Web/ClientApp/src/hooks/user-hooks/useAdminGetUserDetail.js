import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

const useAdminGetUserDetail = (userId) => {
    return useQuery({
        queryKey: ["admin-user-detail", userId],
        queryFn: async () => {
            const client = new UserClient();
            const result = await client.adminGetUserDetail(userId);
            if (!result) throw new Error("Failed to fetch user detail");
            return result;
        },
        enabled: !!userId,
    });
};

export default useAdminGetUserDetail;
