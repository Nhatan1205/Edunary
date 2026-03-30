import { useQuery } from "@tanstack/react-query";
import { RoadmapsClient } from "../../web-api-client.ts";

const useGetRoadmapsAuthor = ({ searchText, pageNumber = 1, pageSize = 10 } = {}) => {
  return useQuery({
    queryKey: ["roadmapsAuthor", { searchText, pageNumber, pageSize }],
    queryFn: async () => {
      const client = new RoadmapsClient();
      return await client.getRoadmapsAuthor(searchText ?? null, pageNumber, pageSize);
    },
  });
};

export default useGetRoadmapsAuthor;
