import { useInfiniteQuery } from "@tanstack/react-query";
import { DirectMessagesClient } from "../../web-api-client.ts";

const useGetConversationMessages = (conversationId, pageSize = 10) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }) => {
      const client = new DirectMessagesClient();
      return await client.getConversationMessages(
        conversationId,
        pageParam ?? null,
        pageSize
      );
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.hasMore && lastPage.items && lastPage.items.length > 0) {
        return lastPage.items[lastPage.items.length - 1].id;
      }
      return undefined;
    },
    enabled: !!conversationId,
  });
};

export default useGetConversationMessages;
