import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, DeleteCourseCommand } from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

const useDeleteCourse = () => {
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
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to delete course. Please try again.";
      toast.error(msg);
    },
  });
};

export default useDeleteCourse;
