import { useQuery } from '@tanstack/react-query';
import { AuthClient } from '../../web-api-client.ts';

const useVerifyRegistration = (token) => {
  return useQuery({
    queryKey: ['verifyRegistration', token],
    queryFn: async () => {
      if (!token) {
        return {
          succeeded: false,
          message: 'Verification link is invalid or expired.'
        };
      }

      const authClient = new AuthClient();
      const result = await authClient.verifyRegistration(token);
      return {
        succeeded: !!result?.succeeded,
        message: result?.message ?? 'Verification link is invalid or expired.'
      };
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useVerifyRegistration;
