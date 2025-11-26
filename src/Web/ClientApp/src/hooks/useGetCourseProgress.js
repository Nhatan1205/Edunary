import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../web-api-client.ts";

const useGetCourseProgress = (courseId) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      return await client.getCourseProgressByCourseId(courseId);
    },
  });
}
export default useGetCourseProgress;