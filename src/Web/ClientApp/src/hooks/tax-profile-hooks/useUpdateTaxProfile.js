import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InstructorTaxClient, UpsertMyTaxProfileCommand } from '../../web-api-client.ts';

const useUpdateTaxProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taxCountryCode, hasSubmittedW8Ben }) => {
      const client = new InstructorTaxClient();
      const command = new UpsertMyTaxProfileCommand({ taxCountryCode, hasSubmittedW8Ben });
      return await client.upsertProfile(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-profile']);
    },
  });
};

export default useUpdateTaxProfile;
