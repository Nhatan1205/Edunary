import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, UpdateCourseCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useUpdateCourse = () => {
  const coursesClient = new CoursesClient();

  return useMutation({
    mutationFn: async (courseData) => {
      const command = new UpdateCourseCommand({
        ...courseData,
      });

      return await coursesClient.updateCourse(command);
    },
    onSuccess: (_, variables) => {
      toast.success("Course updated successfully!");
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", variables.id]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useUpdateCourse;
