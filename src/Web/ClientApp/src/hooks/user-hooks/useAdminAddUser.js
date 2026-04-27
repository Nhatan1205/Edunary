import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthClient, AuthenticateModel, UserClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useAdminAddUser = () => {
    const authClient = new AuthClient();

    return useMutation({
        mutationFn: async ({ email, fullName, password, phone }) => {
            const client = new UserClient()
            const model = new AuthenticateModel({
                email,
                fullName,
                password,
                phoneNumber: phone ?? null,
            });
            return await client.adminCreateUser(model);
        },
        onSuccess: () => {
            toast.success("User created successfully!");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-user-status-counts"] });
        },
        onError: (error) => {
            try {
                const data = JSON.parse(error.response);
                toast.error(data?.message || "Failed to create user.");
            } catch {
                toast.error("Failed to create user.");
            }
        },
    });
};

export default useAdminAddUser;
