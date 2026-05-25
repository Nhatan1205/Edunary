import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, UnpublishCourseCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useUnpublishCourse = () => {
  const client = new CoursesClient();

  return useMutation({
    mutationFn: async ({ courseId, reason }) => {
      const command = new UnpublishCourseCommand({ courseId, reason });
      return await client.unpublishCourse(command);
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Course unpublished successfully");
      queryClient.invalidateQueries(["admin-published-courses"]);
      queryClient.invalidateQueries(["admin-course-stats"]);
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useUnpublishCourse;
