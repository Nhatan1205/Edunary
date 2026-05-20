import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminFinanceClient, UpdatePayoutSettingsCommand } from "../../web-api-client.ts";

const useUpdatePayoutSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const client = new AdminFinanceClient();
      const command = new UpdatePayoutSettingsCommand(payload);
      return await client.updatePayoutSettings(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finance-payout-settings"] });
      queryClient.invalidateQueries({ queryKey: ["finance-eligible-payouts"] });
    },
  });
};

export default useUpdatePayoutSettings;
