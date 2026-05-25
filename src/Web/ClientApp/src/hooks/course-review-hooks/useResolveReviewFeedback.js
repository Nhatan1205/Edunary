import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, ResolveReviewFeedbackCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useResolveReviewFeedback = (courseId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async ({ feedbackId, isResolved }) => {
      const command = new ResolveReviewFeedbackCommand({ feedbackId, isResolved });
      return await client.resolveReviewFeedback(feedbackId, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["course-review-status", courseId]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useResolveReviewFeedback;
