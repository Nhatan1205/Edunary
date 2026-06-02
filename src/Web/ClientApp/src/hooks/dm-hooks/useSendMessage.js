import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DirectMessagesClient, SendMessageCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";
import queryClient from "../../configs/reactQuery.js";

const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ conversationId, content }) => {
      const client = new DirectMessagesClient();
      const command = new SendMessageCommand({ conversationId, content });
      return await client.sendMessage(conversationId, command);
    },

    // Optimistic update: insert a temporary message immediately into cache
    // so the UI feels instant — no waiting for the API round-trip.
    onMutate: async ({ conversationId, content }) => {
      // Cancel any in-flight refetches to prevent overwriting the optimistic entry
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });

      // Snapshot previous state for rollback on error
      const previousMessages = queryClient.getQueryData(["messages", conversationId]);

      // Read current user from cache (staleTime: Infinity so always available)
      const currentUser = queryClient.getQueryData(["userInfo"]);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        content,
        senderId: currentUser?.userId ?? "",
        senderName: currentUser?.fullName ?? "",
        senderAvatar: currentUser?.avatar ?? null,
        isRead: false,
        created: new Date().toISOString(),
        _optimistic: true,
      };

      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        if (newPages[0]) {
          newPages[0] = {
            ...newPages[0],
            items: [optimisticMessage, ...(newPages[0].items || [])],
          };
        }
        return { ...old, pages: newPages };
      });

      return { previousMessages };
    },

    onError: (error, variables, context) => {
      // Rollback optimistic entry on failure
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(
          ["messages", variables.conversationId],
          context.previousMessages
        );
      }
      const msg = extractApiError(error);
      toast.error(msg);
    },

    onSuccess: () => { },
  });
};

export default useSendMessage;
