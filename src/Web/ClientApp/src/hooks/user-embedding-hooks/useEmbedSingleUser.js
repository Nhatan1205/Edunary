import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserEmbeddingsClient } from "../../web-api-client.ts";

const useEmbedSingleUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const client = new UserEmbeddingsClient();
      return await client.embedSingleUser(userId);
    },
    onSuccess: () => {
      toast.success("User embedding job enqueued!");
      queryClient.invalidateQueries({ queryKey: ["user-embedding-sync-status"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to enqueue user embedding. Please try again.");
    },
  });
};

export default useEmbedSingleUser;
