import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient } from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

const useUpdateCourseImage = () => {
  const coursesClient = new CoursesClient();

  return useMutation({
    mutationFn: async ({ id, file }) => {
      if (!id) throw new Error("Course ID is required");
      if (!file) throw new Error("Image file is required");

      // Gọi API update image
      return await coursesClient.updateCourseImage(id, {
        data: file,
        fileName: file.name,
      });
    },
    onSuccess: (_, variables) => {
      // toast.success("Course image updated successfully!");
      // Làm mới lại dữ liệu liên quan
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", variables.id]);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to update course image. Please try again.";
      toast.error(msg);
    },
  });
};

export default useUpdateCourseImage;
