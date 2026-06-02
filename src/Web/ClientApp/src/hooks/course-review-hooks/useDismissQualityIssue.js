import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, DismissQualityIssueCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useDismissQualityIssue = (reportId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (issueId) => {
      const command = new DismissQualityIssueCommand({
        issueId: issueId
      });
      return await client.dismissQualityIssue(command);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Issue dismissed successfully");
      if (reportId) {
        queryClient.invalidateQueries(["quality-report-detail", reportId]);
      }
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to dismiss issue");
    },
  });
};

export default useDismissQualityIssue;
