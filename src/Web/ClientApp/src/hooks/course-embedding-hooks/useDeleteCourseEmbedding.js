import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseEmbeddingsClient } from "../../web-api-client.ts";

const useDeleteCourseEmbedding = () => {
  return useMutation({
    mutationFn: async (courseId) => {
      const client = new CourseEmbeddingsClient();
      return await client.deleteSingle(courseId);
    },
    onSuccess: () => {
      toast.success("Embedding deletion job enqueued.");
      queryClient.invalidateQueries({ queryKey: ["course-embedding-sync-status"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to enqueue deletion. Please try again.");
    },
  });
};

export default useDeleteCourseEmbedding;
