import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useDeleteTaxRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (countryCode) => {
      const response = await fetch(`/api/AdminFinance/tax-regions/${countryCode}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(Array.isArray(err) ? err.join(", ") : "Failed to delete tax region");
      }
    },
    onSuccess: () => {
      toast.success("Tax region deleted");
      queryClient.invalidateQueries({ queryKey: ["finance-tax-regions"] });
    },
    onError: (err) => toast.error(err.message),
  });
};

export default useDeleteTaxRegion;
