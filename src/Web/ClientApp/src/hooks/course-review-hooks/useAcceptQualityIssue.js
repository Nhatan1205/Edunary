import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, AcceptQualityIssueCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useAcceptQualityIssue = (reportId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async ({ issueId, editedContent }) => {
      const command = new AcceptQualityIssueCommand({
        issueId: issueId,
        editedContent: editedContent || ""
      });
      return await client.acceptQualityIssue(command);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Issue accepted successfully");
      if (reportId) {
        queryClient.invalidateQueries(["quality-report-detail", reportId]);
      }
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to accept issue");
    },
  });
};

export default useAcceptQualityIssue;
