import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminChangeUserRole = () => {
    const client = new UserClient();
    return useMutation({
        mutationFn: async ({ userId, newRole }) => {
            return await client.adminChangeUserRole({ userId, newRole });
        },
        onSuccess: (result, { fullName, newRole }) => {
            if (!result?.succeeded) {
                toast.error(result?.message || "Failed to change role.");
                return;
            }
            toast.success(`${fullName ?? "User"}'s role changed to ${newRole}.`);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-detail"] });
        },
        onError: (err) => toast.error(err?.message || "Failed to change role."),
    });
};

export default useAdminChangeUserRole;
