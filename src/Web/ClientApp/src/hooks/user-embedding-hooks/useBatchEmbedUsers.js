import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserEmbeddingsClient } from "../../web-api-client.ts";

const useBatchEmbedUsers = () => {
  return useMutation({
    mutationFn: async () => {
      const client = new UserEmbeddingsClient();
      return await client.batchEmbedUsers();
    },
    onSuccess: () => {
      toast.success("Batch user embedding job enqueued! Check Hangfire dashboard for progress.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to enqueue batch user embedding. Please try again.");
    },
  });
};

export default useBatchEmbedUsers;
