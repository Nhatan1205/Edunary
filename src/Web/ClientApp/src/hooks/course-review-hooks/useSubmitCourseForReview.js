import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, SubmitCourseForReviewCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useSubmitCourseForReview = () => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const command = new SubmitCourseForReviewCommand({ courseId });
      return await client.submitCourseForReview(command);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useSubmitCourseForReview;
