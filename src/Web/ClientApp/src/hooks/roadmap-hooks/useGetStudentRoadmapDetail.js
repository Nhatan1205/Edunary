import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetStudentRoadmapDetail = (roadmapId) => {
  return useQuery({
    queryKey: ["studentRoadmapDetail", roadmapId],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getRoadmapDetail(roadmapId);
    },
    enabled: !!roadmapId,
    refetchOnWindowFocus: false,
  });
};

export default useGetStudentRoadmapDetail;
