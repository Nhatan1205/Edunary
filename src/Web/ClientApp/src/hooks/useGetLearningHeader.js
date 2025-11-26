import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../web-api-client.ts";

const useGetLearningHeader = (courseId) => {
  return useQuery({
    queryKey: ["learningHeader"],
    queryFn: async () => {
        const client = new CourseProgressClient();
        return await client.getLearningHeaderByCourseId(courseId);
    },
  });
}
export default useGetLearningHeader;