import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateTaxSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await fetch("/api/AdminFinance/tax-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Failed to update tax settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finance-tax-settings"] });
    },
  });
};

export default useUpdateTaxSettings;
