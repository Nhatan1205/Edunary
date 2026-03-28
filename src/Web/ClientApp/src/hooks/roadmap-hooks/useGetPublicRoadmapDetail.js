import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetPublicRoadmapDetail = (id) => {
  return useQuery({
    queryKey: ["public-roadmap-detail", id],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getPublicRoadmapDetail(id);
    },
    enabled: !!id,
  });
};

export default useGetPublicRoadmapDetail;
