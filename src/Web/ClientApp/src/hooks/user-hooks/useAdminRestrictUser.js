import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

// durationDays = null → permanent ban, có giá trị → suspend tạm thời
const useAdminRestrictUser = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId, durationDays = null, reason }) => {
            const result = await client.adminRestrictUser({ userId, durationDays, reason: reason ?? "" });
            if (!result?.succeeded) throw new Error(result?.errors?.[0] ?? "Failed to restrict user.");
            return result;
        },
        onSuccess: (_, { fullName, durationDays }) => {
            const label = durationDays == null
                ? "permanently banned"
                : `suspended for ${durationDays} day(s)`;
            toast.success(`${fullName ?? "User"} has been ${label}.`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-detail"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-status-counts"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to restrict user."),
    });
};

export default useAdminRestrictUser;
