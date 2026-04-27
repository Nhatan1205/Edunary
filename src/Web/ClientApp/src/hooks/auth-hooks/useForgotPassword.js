import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthClient, ForgotPasswordRequest } from '../../web-api-client.ts';

const useForgotPassword = () => {
  const authClient = new AuthClient();

  return useMutation({
    mutationFn: async (email) => {
      const request = new ForgotPasswordRequest({ email });
      return await authClient.forgotPassword(request);
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'If the email is eligible, a password reset link has been sent.');
    },
    onError: (error) => {
      let msg = 'Unable to send reset email. Please try again.';
      if (error.response) {
        try {
          const data = JSON.parse(error.response);
          msg = data?.message || msg;
        } catch {
          msg = error.response;
        }
      }
      toast.error(msg);
    }
  });
};

export default useForgotPassword;
