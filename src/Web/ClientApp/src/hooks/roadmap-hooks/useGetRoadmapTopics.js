import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

/**
 * Fetch roadmap topics (PaginatedList) with optional search.
 * Default: page 1, pageSize 16.
 * Caller debounces searchQuery before passing here.
 */
const useGetRoadmapTopics = ({ searchQuery = null, pageNumber = 1, pageSize = 24 } = {}) => {
  return useQuery({
    queryKey: ["roadmap-topics", { searchQuery, pageNumber, pageSize }],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getRoadmapTopics(searchQuery ?? null, pageNumber, pageSize);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export default useGetRoadmapTopics;
