import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, UpdateReviewFeedbackCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useUpdateReviewFeedback = (submissionId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async ({ feedbackId, ...data }) => {
      const command = new UpdateReviewFeedbackCommand({ feedbackId, ...data });
      return await client.updateReviewFeedback(feedbackId, command);
    },
    onSuccess: () => {
      toast.success("Feedback updated.");
      queryClient.invalidateQueries(["admin-course-preview", submissionId]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useUpdateReviewFeedback;
