import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetRelatedRoadmaps = (courseId) => {
  return useQuery({
    queryKey: ["relatedRoadmaps", courseId],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getRelatedRoadmapsByCourseId(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetRelatedRoadmaps;
