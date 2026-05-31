import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, RunInstructorQualityCheckCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";

const useRunInstructorQualityCheck = () => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const command = new RunInstructorQualityCheckCommand({ courseId });
      return await client.runInstructorQualityCheck(command);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to trigger AI quality check");
    },
  });
};

export default useRunInstructorQualityCheck;
