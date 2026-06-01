import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetInstructorQualityReportDetail = (reportId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["instructor-quality-report-detail", reportId],
    queryFn: async () => {
      return await client.getInstructorQualityReportDetail(reportId);
    },
    enabled: !!reportId,
  });
};

export default useGetInstructorQualityReportDetail;
