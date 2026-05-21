import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AdminFinanceClient, UpsertTaxRegionCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useUpsertTaxRegion = () => {

  return useMutation({
    mutationFn: async (data) => {
      const client = new AdminFinanceClient();
      const command = new UpsertTaxRegionCommand(data);
      return await client.upsertTaxRegion(command);
    },
    onSuccess: () => {
      toast.success("Tax region saved");
      queryClient.invalidateQueries({ queryKey: ["finance-tax-regions"] });
    },
    onError: (error) =>
      toast.error(extractApiError(error) || error?.message || "Failed to save tax region"),
  });
};

export default useUpsertTaxRegion;
