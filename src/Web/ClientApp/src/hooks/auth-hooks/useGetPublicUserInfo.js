import { useQuery } from '@tanstack/react-query';
import { UserClient } from '../../web-api-client.ts';
import { useNavigate } from 'react-router';

/**
 * React Query hook to fetch public profile information of a user by ID
 * @param {string} userId - The user ID to fetch public info for
 * @returns {Object} React Query result with public user data
 */
const useGetPublicUserInfo = (userId) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ['publicUserInfo', userId],
    queryFn: async () => {
      const userClient = new UserClient();
      const result = await userClient.getPublicUserInfo(userId);
      if (!result || !result.id) {
        navigate("/");
      }
      if (!result) {
        throw new Error('Failed to fetch public user information');
      }

      return {
        userId: result.id,
        email: result.email,
        fullName: result.fullName,
        phoneNumber: result.phoneNumber,
        avatar: result.avatar,
        headline: result.headline ?? '',
        description: result.description ?? '',
        links: result.links ?? {},
        totalLearners: result.totalLearners ?? 0,
        totalReviews: result.totalReviews ?? 0,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetPublicUserInfo;
