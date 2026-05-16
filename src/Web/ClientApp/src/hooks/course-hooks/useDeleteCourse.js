import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, DeleteCourseCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers";

const useDeleteCourse = (onSuccessCallback) => {
  const coursesClient = new CoursesClient();

  return useMutation({
    mutationFn: async (courseId) => {
      const command = new DeleteCourseCommand({
        id: courseId,
      });
      return await coursesClient.deleteCourse(command);
    },
    onSuccess: () => {
      toast.success("Course deleted successfully!");
      queryClient.invalidateQueries(["courses"]);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteCourse;
