import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InstructorWalletClient, WithdrawFromInstructorWalletCommand } from "../../web-api-client.ts";

const useWithdrawFromInstructorWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, currency = "USD" }) => {
      const client = new InstructorWalletClient();
      const command = new WithdrawFromInstructorWalletCommand({ amount, currency });
      return await client.withdraw(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-wallet-transactions"] });
    },
  });
};

export default useWithdrawFromInstructorWallet;
