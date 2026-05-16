import { useQuery } from "@tanstack/react-query";

const useGetEligiblePayouts = () => {
  return useQuery({
    queryKey: ["finance-eligible-payouts"],
    queryFn: async () => {
      const response = await fetch("/api/AdminFinance/payouts/eligible", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch eligible payouts");
      return response.json();
    },
  });
};

export default useGetEligiblePayouts;
