import { useMutation } from '@tanstack/react-query';
import queryClient from '../../configs/reactQuery.js';
import { UpdatePayoutAccountCommand, UserClient } from '../../web-api-client.ts';

async function updatePayoutAccount(payload) {
  const client = new UserClient();
  const command = new UpdatePayoutAccountCommand(payload);
  return await client.updatePayoutAccount(command);
}

const useUpdatePaymentAccount = () => {
  return useMutation({
    mutationFn: updatePayoutAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    },
  });
};

export default useUpdatePaymentAccount;
