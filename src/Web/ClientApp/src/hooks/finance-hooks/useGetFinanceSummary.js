import { useQuery } from "@tanstack/react-query";

const useGetFinanceSummary = (from = null, to = null) => {
  return useQuery({
    queryKey: ["finance-summary", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("From", new Date(from).toISOString());
      if (to) params.set("To", new Date(to).toISOString());

      const response = await fetch(`/api/AdminFinance/summary?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch finance summary");
      return response.json();
    },
    keepPreviousData: true,
  });
};

export default useGetFinanceSummary;
