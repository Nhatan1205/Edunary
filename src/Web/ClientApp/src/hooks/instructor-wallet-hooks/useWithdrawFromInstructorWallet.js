import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";

const useWithdrawFromInstructorWallet = () => {
  return useMutation({
    mutationFn: async ({ amount, currency = "USD" }) => {
      const response = await fetch("/api/InstructorWallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ amount, currency }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message = payload?.message || payload?.toString() || "Failed to withdraw";
        throw new Error(message);
      }

      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["instructor-wallet"]);
      queryClient.invalidateQueries(["instructor-wallet-transactions"]);
    },
  });
};

export default useWithdrawFromInstructorWallet;
