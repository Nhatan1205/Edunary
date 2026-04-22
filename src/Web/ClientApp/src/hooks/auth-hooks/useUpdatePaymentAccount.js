import { useMutation, useQueryClient } from '@tanstack/react-query';

async function updatePayoutAccount(payload) {
  const response = await fetch('/api/User/payout-account', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update payout account');
  }
}

const useUpdatePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePayoutAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    },
  });
};

export default useUpdatePaymentAccount;
