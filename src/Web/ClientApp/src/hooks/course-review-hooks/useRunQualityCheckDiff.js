import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, RunQualityCheckDiffCommand } from "../../web-api-client.ts";
import { extractApiError } from "../../utils/helpers.js";

const useRunQualityCheckDiff = () => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const command = new RunQualityCheckDiffCommand({ courseId });
      return await client.runQualityCheckDiff(command);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to trigger AI diff quality check");
    },
  });
};

export default useRunQualityCheckDiff;
