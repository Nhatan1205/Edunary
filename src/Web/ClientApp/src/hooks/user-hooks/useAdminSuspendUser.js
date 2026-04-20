import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

// durationDays mặc định 7 ngày
const useAdminSuspendUser = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId, durationDays = 7, reason }) => {
            const result = await client.adminSuspendUser({ userId, durationDays, reason: reason ?? "" });
            if (!result?.succeeded) throw new Error(result?.errors?.[0] ?? "Failed to suspend user.");
            return result;
        },
        onSuccess: (_, { fullName, durationDays = 7 }) => {
            toast.success(`${fullName ?? "User"} has been suspended for ${durationDays} day(s).`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-status-counts"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to suspend user."),
    });
};

export default useAdminSuspendUser;
