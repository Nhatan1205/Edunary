import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetPublicRoadmaps = ({ roadmapTopicId, searchText, pageNumber = 1, pageSize = 10 } = {}) => {
  return useQuery({
    queryKey: ["public-roadmaps", { roadmapTopicId, searchText, pageNumber, pageSize }],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getPublicRoadmaps(roadmapTopicId, searchText, pageNumber, pageSize);
    },
  });
};

export default useGetPublicRoadmaps;
