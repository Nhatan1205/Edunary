import { useQuery } from "@tanstack/react-query";
import { DirectMessagesClient } from "../../web-api-client.ts";

const useGetConversations = (params) => {
  const { pageNumber = 1, pageSize = 20, filter, sortBy, searchText } = params || {};

  return useQuery({
    queryKey: ["conversations", { pageNumber, pageSize, filter, sortBy, searchText }],
    queryFn: async () => {
      const client = new DirectMessagesClient();
      return await client.getConversations(
        pageNumber,
        pageSize,
        filter ?? null,
        sortBy ?? null,
        searchText ?? null
      );
    },
  });
};

export default useGetConversations;
