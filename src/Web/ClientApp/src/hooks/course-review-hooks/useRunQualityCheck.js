import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, RunQualityCheckCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";

const useRunQualityCheck = () => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const command = new RunQualityCheckCommand({ courseId });
      return await client.runQualityCheck(command);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to trigger AI quality check");
    },
  });
};

export default useRunQualityCheck;
