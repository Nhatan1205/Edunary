import { useMutation } from "@tanstack/react-query";
import queryClient from "../configs/reactQuery.js";
import { toast } from "react-toastify";
import { CourseContentClient } from "../web-api-client.ts";

const useDeleteCourseContentById = () => {
  return useMutation({
    mutationFn: async (id) => {
      const client = new CourseContentClient();
      return await toast.promise(
        client.deleteCourseContentById(id),
        {
          pending: "Deleting course content...",
          success: "Course content deleted successfully!",
          error: "Failed to delete course content",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseContents"] });
    },
  });
};

export default useDeleteCourseContentById;
