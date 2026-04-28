import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseTopicsClient, DeleteCourseTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useDeleteCourseTopic = () => {
  const client = new CourseTopicsClient();

  return useMutation({
    mutationFn: async (id) => {
      const command = new DeleteCourseTopicCommand({ id });
      const result = await client.deleteCourseTopic(command);
      if (!result.succeeded) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      toast.success("Course topic deleted successfully!");
      queryClient.invalidateQueries(["courseTopics"]);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete course topic.");
    },
  });
};

export default useDeleteCourseTopic;
