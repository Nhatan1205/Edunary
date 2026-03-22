import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { tokenService } from "../../utils/tokenService";

const useCreateCourseContent = () => {

  return useMutation({
    mutationFn: async ({ file, isOverride = false, courseId = null }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isOverride", isOverride.toString());
      if (courseId !== null) {
        formData.append("courseId", courseId.toString());
      }

      const token = tokenService.getToken();

      const response = await fetch("/api/CourseContent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create course content");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Course content uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["courseContents"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload course content");
    },
  });
};

export default useCreateCourseContent;