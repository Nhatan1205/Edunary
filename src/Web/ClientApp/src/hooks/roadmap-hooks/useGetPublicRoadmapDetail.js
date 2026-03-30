import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetPublicRoadmapDetail = (id) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["public-roadmap-detail", id],
    queryFn: async () => {
      const client = new RoadmapsClient();
      const result = await client.getPublicRoadmapDetail(id);
      if (!result || !result.id) {
        navigate("/career-paths");
      }
      return result;
    },
    enabled: !!id,
  });
};

export default useGetPublicRoadmapDetail;
