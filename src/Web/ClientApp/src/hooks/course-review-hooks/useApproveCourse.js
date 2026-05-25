import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseReviewsClient, ApproveCourseCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useApproveCourse = (submissionId) => {
  const client = new CourseReviewsClient();

  return useMutation({
    mutationFn: async () => {
      const command = new ApproveCourseCommand({ submissionId });
      return await client.approveCourse(command);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Course approved successfully");
      queryClient.invalidateQueries(["admin-course-preview", submissionId]);
      queryClient.invalidateQueries(["pending-review-courses"]);
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useApproveCourse;
