import { useQuery } from '@tanstack/react-query';
import { UserClient } from '../web-api-client.ts';
import { useAuth } from '../context/AuthContext';

/**
 * React Query hook to fetch basic customer information from the API
 * @returns {Object} React Query result with user data
 */
const useGetBasicUserInfo = () => {
  const { isAuthenticated } = useAuth(); 

  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const userClient = new UserClient();
      const result = await userClient.getBasicInfo();
      
      if (!result) {
        throw new Error('Failed to fetch customer information');
      }

      const userData = {
        userId: result.id,
        email: result.email,
        fullName: result.fullName,
        phoneNumber: result.phoneNumber,
        avatar: result.avatar,
      };
      return userData;
    },
    staleTime: Infinity,    
    refetchOnMount: false,   
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isAuthenticated, 
  });
};

export default useGetBasicUserInfo;
