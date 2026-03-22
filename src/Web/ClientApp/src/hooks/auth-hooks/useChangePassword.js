import { useMutation } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { tokenService } from "../../utils/tokenService.js";

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
      let msg = "An error occurred while changing password.";

      if (error?.response) {
        try {
          const data = JSON.parse(error.response);
          msg = data.message;
        } catch {
          msg = error.message;
        }
      }

      toast.error(msg);
    },
  });
};

export default useChangePassword;
