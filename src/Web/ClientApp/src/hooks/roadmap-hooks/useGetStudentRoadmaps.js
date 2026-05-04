import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetStudentRoadmaps = ({ pageNumber = 1, pageSize = 10 } = {}) => {
  return useQuery({
    queryKey: ["student-roadmaps", { pageNumber, pageSize }],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getStudentRoadmaps(pageNumber, pageSize);
    },
  });
};

export default useGetStudentRoadmaps;
