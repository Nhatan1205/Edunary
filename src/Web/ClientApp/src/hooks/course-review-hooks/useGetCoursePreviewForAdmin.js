import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetCoursePreviewForAdmin = (submissionId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["admin-course-preview", submissionId],
    queryFn: async () => {
      return await client.getCoursePreviewForAdmin(submissionId);
    },
    enabled: !!submissionId,
  });
};

export default useGetCoursePreviewForAdmin;
