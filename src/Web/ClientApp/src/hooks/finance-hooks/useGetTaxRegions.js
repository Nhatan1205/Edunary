import { useQuery } from "@tanstack/react-query";

const useGetTaxRegions = () => {
  return useQuery({
    queryKey: ["finance-tax-regions"],
    queryFn: async () => {
      const response = await fetch("/api/AdminFinance/tax-regions", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tax regions");
      return response.json();
    },
  });
};

export default useGetTaxRegions;
