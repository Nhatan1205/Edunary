import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthClient, AuthenticateModel } from '../../web-api-client.ts';

const useRegister = (options = {}) => {
  const authClient = new AuthClient();

  return useMutation({
    mutationFn: async (userData) => {
      const model = new AuthenticateModel({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phoneNumber: userData.phone
      });

      const result = await authClient.register(model);
      return { result, email: userData.email };
    },
    onSuccess: ({ result, email }) => {
      toast.success(result?.message || 'If the email is eligible, a verification link has been sent.');
      if (options.onSuccess) {
        options.onSuccess({ result, email });
      }
    },
    onError: (error) => {
      let msg = 'Registration failed. Please try again.';
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

export default useRegister;
