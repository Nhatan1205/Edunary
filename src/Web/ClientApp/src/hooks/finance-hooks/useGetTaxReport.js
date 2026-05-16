import { useQuery } from "@tanstack/react-query";

const useGetTaxReport = (period = null) => {
  return useQuery({
    queryKey: ["finance-tax-report", period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.set("period", period);

      const response = await fetch(`/api/AdminFinance/tax-report?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch tax report");
      return response.json();
    },
  });
};

export default useGetTaxReport;
