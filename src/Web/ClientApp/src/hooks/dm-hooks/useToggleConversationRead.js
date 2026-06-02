import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, ToggleConversationReadCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useToggleConversationRead = () => {
  return useMutation({
    mutationFn: async ({ conversationId, isRead }) => {
      const client = new DirectMessagesClient();
      const command = new ToggleConversationReadCommand({ conversationId, isRead });
      return await client.toggleConversationRead(command);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["messages", variables.conversationId]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useToggleConversationRead;
