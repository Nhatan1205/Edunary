import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { tokenService } from "../../utils/tokenService.js";

const useCreateMediaFile = () => {

  return useMutation({
    mutationFn: async ({ file, isOverride = false, courseId = null }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isOverride", isOverride.toString());
      if (courseId !== null) {
        formData.append("courseId", courseId.toString());
      }

      const token = tokenService.getToken();

      const response = await fetch("/api/MediaFile", {
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
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload course content");
    },
  });
};

export default useCreateMediaFile;