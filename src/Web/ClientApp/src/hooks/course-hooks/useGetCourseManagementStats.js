import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../../web-api-client.ts";

const useGetCourseManagementStats = () => {
  const client = new CoursesClient();

  return useQuery({
    queryKey: ["admin-course-stats"],
    queryFn: async () => {
      return await client.getCourseManagementStats();
    },
  });
};

export default useGetCourseManagementStats;
