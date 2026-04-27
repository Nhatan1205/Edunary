import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthClient, ResendVerificationRequest } from '../../web-api-client.ts';

const useResendVerification = () => {
  const authClient = new AuthClient();

  return useMutation({
    mutationFn: async (email) => {
      const request = new ResendVerificationRequest({ email });
      return await authClient.resendVerification(request);
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'Verification email sent. Please check your inbox.');
    },
    onError: (error) => {
      let msg = 'Unable to resend verification email. Please try again.';
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

export default useResendVerification;
