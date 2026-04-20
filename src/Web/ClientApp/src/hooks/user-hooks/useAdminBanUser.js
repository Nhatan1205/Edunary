import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminBanUser = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId, reason }) => {
            const result = await client.adminBanUser({ userId, reason: reason ?? "" });
            console.log("useAdminBanUserL: ", result);
            if (!result?.succeeded) throw new Error(result?.errors?.[0] ?? "Failed to ban user.");
            return result;
        },
        onSuccess: (_, { fullName }) => {
            toast.success(`${fullName ?? "User"} has been banned.`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-status-counts"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to ban user."),
    });
};

export default useAdminBanUser;
