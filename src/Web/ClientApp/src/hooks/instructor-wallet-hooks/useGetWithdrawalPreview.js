import { useMutation } from "@tanstack/react-query";

const useGetWithdrawalPreview = () => {
  return useMutation({
    mutationFn: async ({ amount, currency = "USD" }) => {
      const response = await fetch("/api/InstructorWallet/withdraw/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ amount, currency }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to preview withdrawal.");
      }

      return response.json();
    },
  });
};

export default useGetWithdrawalPreview;
