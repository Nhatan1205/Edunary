import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetQualityReports = (courseId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["quality-reports", courseId],
    queryFn: async () => {
      return await client.getQualityReports(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetQualityReports;
