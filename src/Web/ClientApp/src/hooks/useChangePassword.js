import { useMutation } from "@tanstack/react-query";
import { UserClient } from "../web-api-client.ts";
import { toast } from "react-toastify";
import { tokenService } from "../utils/tokenService";

const useChangePassword = (onSuccessCallback) => {
  const userClient = new UserClient();

  return useMutation({
    mutationFn: async (passwordData) => {
      return await userClient.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
    },
    onSuccess: () => {
        toast.success("Password changed successfully!");
        tokenService.clearRequiresPasswordChange();
        if (onSuccessCallback) {
            onSuccessCallback();
        }
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "An error occurred while changing password.";
      toast.error(msg);
    },
  });
};

export default useChangePassword;
