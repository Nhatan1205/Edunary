import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, RequestChangesCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useRequestChanges = (submissionId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async ({ adminNote }) => {
      const command = new RequestChangesCommand({ submissionId, adminNote });
      return await client.requestChanges(command);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Changes requested. Instructor will be notified.");
      queryClient.invalidateQueries(["admin-course-preview", submissionId]);
      queryClient.invalidateQueries(["pending-review-courses"]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useRequestChanges;
