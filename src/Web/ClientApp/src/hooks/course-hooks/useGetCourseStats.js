import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../../web-api-client.ts";

const useGetCourseStats = (courseId, dateRange, metric) => {
  return useQuery({
    queryKey: ["courseStats", courseId, dateRange, metric],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCourseStats(courseId, dateRange, metric);

      if (!result) {
        throw new Error("Failed to fetch course statistics");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export default useGetCourseStats;
