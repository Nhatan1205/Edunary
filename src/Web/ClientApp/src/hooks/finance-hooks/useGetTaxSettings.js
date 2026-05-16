import { useQuery } from "@tanstack/react-query";

const useGetTaxSettings = () => {
  return useQuery({
    queryKey: ["admin-finance-tax-settings"],
    queryFn: async () => {
      const response = await fetch("/api/AdminFinance/tax-settings", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tax settings");
      return response.json();
    },
  });
};

export default useGetTaxSettings;
