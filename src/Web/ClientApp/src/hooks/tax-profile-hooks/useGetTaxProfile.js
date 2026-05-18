import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { InstructorTaxClient } from '../../web-api-client.ts';

const useGetTaxProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['tax-profile'],
    queryFn: async () => {
      const client = new InstructorTaxClient();
      return await client.getMyInstructorTaxProfile();
    },
    enabled: isAuthenticated,
  });
};

export default useGetTaxProfile;
