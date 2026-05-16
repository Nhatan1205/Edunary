import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useUpsertTaxRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/AdminFinance/tax-regions", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(Array.isArray(err) ? err.join(", ") : "Failed to save tax region");
      }
    },
    onSuccess: () => {
      toast.success("Tax region saved");
      queryClient.invalidateQueries({ queryKey: ["finance-tax-regions"] });
    },
    onError: (err) => toast.error(err.message),
  });
};

export default useUpsertTaxRegion;
