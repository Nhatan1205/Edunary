import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthClient, ResetPasswordRequest } from '../../web-api-client.ts';

const useResetPassword = (options = {}) => {
  const authClient = new AuthClient();

  return useMutation({
    mutationFn: async ({ email, token, newPassword, confirmPassword }) => {
      const request = new ResetPasswordRequest({
        email,
        token,
        newPassword,
        confirmPassword,
      });

      return await authClient.resetPassword(request);
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'Password has been reset successfully.');
      if (options.onSuccess) {
        options.onSuccess(result);
      }
    },
    onError: (error) => {
      let msg = 'Unable to reset password. Please try again.';
      if (error.response) {
        try {
          const data = JSON.parse(error.response);
          msg = data?.message || msg;
        } catch {
          msg = error.response;
        }
      }
      toast.error(msg);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export default useResetPassword;
