import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminChangeUserRole = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId, newRole }) => {
            // NSwag client tự throw ApiException khi HTTP 4xx/5xx
            await client.adminChangeUserRole({ userId, newRole });
        },
        onSuccess: (_, { fullName, newRole }) => {
            toast.success(`${fullName ?? "User"}'s role changed to ${newRole}.`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to change role."),
    });
};

export default useAdminChangeUserRole;
