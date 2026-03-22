import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, UpdateCourseCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

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
      // Invalidate cả danh sách courses và course detail
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", variables.id]);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to update course. Please try again.";
      toast.error(msg);
    },
  });
};

export default useUpdateCourse;
