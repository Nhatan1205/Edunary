import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseEmbeddingsClient } from "../../web-api-client.ts";

const useEmbedSingleCourse = () => {
  return useMutation({
    mutationFn: async (courseId) => {
      const client = new CourseEmbeddingsClient();
      return await client.embedSingle(courseId);
    },
    onSuccess: () => {
      toast.success("Embedding job enqueued for course.");
      queryClient.invalidateQueries({ queryKey: ["course-embedding-sync-status"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to enqueue embedding. Please try again.");
    },
  });
};

export default useEmbedSingleCourse;
