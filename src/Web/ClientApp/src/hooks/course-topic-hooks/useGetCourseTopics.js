import { useQuery } from "@tanstack/react-query";
import { CourseTopicsClient } from "../../web-api-client.ts";

const useGetCourseTopics = (searchText, pageNumber, pageSize) => {
  return useQuery({
    queryKey: ["courseTopics", searchText, pageNumber, pageSize],
    queryFn: async () => {
      const client = new CourseTopicsClient();
      const result = await client.getCourseTopics(searchText || null, pageNumber, pageSize);
      if (!result) throw new Error("Failed to fetch course topics");
      return result;
    },
    staleTime: 30 * 1000,
  });
};

export default useGetCourseTopics;
