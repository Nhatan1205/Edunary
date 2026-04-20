import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminUnbanUser = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId }) => {
            const result = await client.adminUnbanUser({ userId });
            if (!result?.succeeded) throw new Error(result?.errors?.[0] ?? "Failed to unban user.");
            return result;
        },
        onSuccess: (_, { fullName }) => {
            toast.success(`${fullName ?? "User"} has been unbanned.`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-status-counts"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to unban user."),
    });
};

export default useAdminUnbanUser;
