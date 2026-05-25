import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetCourseReviewStatus = (courseId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["course-review-status", courseId],
    queryFn: async () => {
      return await client.getCourseReviewStatus(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetCourseReviewStatus;
