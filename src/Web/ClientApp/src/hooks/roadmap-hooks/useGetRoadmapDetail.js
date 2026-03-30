import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetRoadmapDetail = (roadmapId) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["roadmapDetail", roadmapId],
    queryFn: async () => {
      const client = new RoadmapsClient();
      const result = await client.getRoadmapDetail(roadmapId);
      if (!result || !result.id) {
        navigate("/instructor/roadmaps");
      }
      return result;
    },
    enabled: !!roadmapId,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};

export default useGetRoadmapDetail;
