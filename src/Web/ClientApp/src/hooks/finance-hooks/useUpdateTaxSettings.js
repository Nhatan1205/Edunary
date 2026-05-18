import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminFinanceClient, UpdateTaxSettingsRequest } from "../../web-api-client.ts";

const useUpdateTaxSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const client = new AdminFinanceClient();
      const request = new UpdateTaxSettingsRequest(payload);
      return await client.updateTaxSettings(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finance-tax-settings"] });
    },
  });
};

export default useUpdateTaxSettings;
