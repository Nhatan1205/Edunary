import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetCourseChangesComparison = (courseId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["course-changes-comparison", courseId],
    queryFn: async () => {
      return await client.getCourseChangesComparison(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetCourseChangesComparison;
