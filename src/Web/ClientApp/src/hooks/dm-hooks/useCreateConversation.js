import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, CreateConversationCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useCreateConversation = () => {
  return useMutation({
    mutationFn: async (targetUserId) => {
      const client = new DirectMessagesClient();
      const command = new CreateConversationCommand({ targetUserId });
      return await client.createConversation(command);
    },
    onSuccess: (response) => {
      if (response && response.result > 0) {
        queryClient.invalidateQueries(["conversations"]);
      } else if (response && response.message) {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      const msg = error?.response || error?.message || "Failed to create conversation.";
      toast.error(msg);
    },
  });
};

export default useCreateConversation;
