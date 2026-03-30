import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetRoadmapTopics = () => {
  return useQuery({
    queryKey: ["roadmap-topics"],
    queryFn: async () => {
      const roadmapsClient = new RoadmapsClient();
      return await roadmapsClient.getTopics();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes — topics don't change often
  });
};

export default useGetRoadmapTopics;
