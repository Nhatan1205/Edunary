import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, SendMessageCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ conversationId, content }) => {
      const client = new DirectMessagesClient();
      const command = new SendMessageCommand({ conversationId, content });
      return await client.sendMessage(conversationId, command);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["messages", variables.conversationId]);
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: (error) => {
      const msg = error?.response || error?.message || "Failed to send message.";
      toast.error(msg);
    },
  });
};

export default useSendMessage;
