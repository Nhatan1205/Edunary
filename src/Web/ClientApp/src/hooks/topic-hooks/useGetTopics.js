import { useQuery } from "@tanstack/react-query";
import { TopicsClient } from "../../web-api-client.ts";

const useGetTopics = (searchText, pageNumber, pageSize) => {
  return useQuery({
    queryKey: ["topics", searchText, pageNumber, pageSize],
    queryFn: async () => {
      const client = new TopicsClient();
      const result = await client.getTopics(searchText || null, pageNumber, pageSize);
      if (!result) throw new Error("Failed to fetch topics");
      return result;
    },
    staleTime: 30 * 1000,
  });
};

export default useGetTopics;
