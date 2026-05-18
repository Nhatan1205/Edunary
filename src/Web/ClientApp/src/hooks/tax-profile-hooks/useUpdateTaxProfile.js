import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InstructorTaxClient, UpsertMyTaxProfileCommand } from '../../web-api-client.ts';

const useUpdateTaxProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ realName, taxIdentificationNumber, taxCountryCode }) => {
      const client = new InstructorTaxClient();
      const command = new UpsertMyTaxProfileCommand({
        realName,
        taxIdentificationNumber,
        taxCountryCode,
      });
      return await client.upsertMyTaxProfile(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profile'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-preview'] });
    },
  });
};

export default useUpdateTaxProfile;
