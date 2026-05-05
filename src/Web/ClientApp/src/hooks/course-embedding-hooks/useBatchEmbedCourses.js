import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseEmbeddingsClient } from "../../web-api-client.ts";

const useBatchEmbedCourses = () => {
  return useMutation({
    mutationFn: async () => {
      const client = new CourseEmbeddingsClient();
      return await client.batchEmbed();
    },
    onSuccess: () => {
      toast.success("Batch embedding job enqueued! Check Hangfire dashboard for progress.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to enqueue batch embedding. Please try again.");
    },
  });
};

export default useBatchEmbedCourses;
