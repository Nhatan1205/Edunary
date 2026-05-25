import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useDeleteReviewFeedback = (submissionId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (feedbackId) => {
      return await client.deleteReviewFeedback(feedbackId);
    },
    onSuccess: () => {
      // toast.success("Feedback deleted.");
      queryClient.invalidateQueries(["admin-course-preview", submissionId]);
    },
  });
};

export default useDeleteReviewFeedback;
