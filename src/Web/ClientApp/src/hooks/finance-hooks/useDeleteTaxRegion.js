import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AdminFinanceClient } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useDeleteTaxRegion = () => {

  return useMutation({
    mutationFn: async (countryCode) => {
      const client = new AdminFinanceClient();
      return await client.deleteTaxRegion(countryCode);
    },
    onSuccess: () => {
      toast.success("Tax region deleted");
      queryClient.invalidateQueries({ queryKey: ["finance-tax-regions"] });
    },
    onError: (error) =>
      toast.error(extractApiError(error) || error?.message || "Failed to delete tax region"),
  });
};

export default useDeleteTaxRegion;
