import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetInstructorQualityReports = (courseId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["instructor-quality-reports", courseId],
    queryFn: async () => {
      return await client.getInstructorQualityReports(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetInstructorQualityReports;
