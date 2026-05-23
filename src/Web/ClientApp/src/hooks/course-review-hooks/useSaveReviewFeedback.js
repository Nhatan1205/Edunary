import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, SaveReviewFeedbackCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useSaveReviewFeedback = (submissionId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new SaveReviewFeedbackCommand({ ...data });
      return await client.saveReviewFeedback(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-course-preview", submissionId]);
    },
  });
};

export default useSaveReviewFeedback;
