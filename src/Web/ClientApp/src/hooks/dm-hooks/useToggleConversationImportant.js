import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, ToggleConversationImportantCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useToggleConversationImportant = () => {
  return useMutation({
    mutationFn: async ({ conversationId, isImportant }) => {
      const client = new DirectMessagesClient();
      const command = new ToggleConversationImportantCommand({ conversationId, isImportant });
      return await client.toggleConversationImportant(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useToggleConversationImportant;
