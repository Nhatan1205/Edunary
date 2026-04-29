import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { TopicsClient, CreateTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useCreateTopic = () => {
  const client = new TopicsClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new CreateTopicCommand({ name: data.name });
      return await client.createTopic(command);
    },
    onSuccess: (response) => {
      if (response?.result) {
        toast.success("Topic created successfully!");
        queryClient.invalidateQueries(["topics"]);
      } else {
        toast.error(response?.message || "Failed to create topic.");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create topic.");
    },
  });
};

export default useCreateTopic;
