import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { TopicsClient, DeleteTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useDeleteTopic = () => {
  const client = new TopicsClient();

  return useMutation({
    mutationFn: async (id) => {
      const command = new DeleteTopicCommand({ id });
      const result = await client.deleteTopic(command);
      if (!result.succeeded) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      toast.success("Topic deleted successfully!");
      queryClient.invalidateQueries(["topics"]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete topic.");
    },
  });
};

export default useDeleteTopic;
