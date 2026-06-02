import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetQualityReportDetail = (reportId) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["quality-report-detail", reportId],
    queryFn: async () => {
      return await client.getQualityReportDetail(reportId);
    },
    enabled: !!reportId,
  });
};

export default useGetQualityReportDetail;
