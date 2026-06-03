import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, ToggleConversationBlockCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useToggleConversationBlock = () => {
  return useMutation({
    mutationFn: async ({ conversationId, isBlocked }) => {
      const client = new DirectMessagesClient();
      const command = new ToggleConversationBlockCommand({ conversationId, isBlocked });
      return await client.toggleConversationBlock(command);
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

export default useToggleConversationBlock;
