import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseTopicsClient, UpdateCourseTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateCourseTopic = () => {
  const client = new CourseTopicsClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new UpdateCourseTopicCommand({ id: data.id, name: data.name });
      const result = await client.updateCourseTopic(command);
      if (!result.succeeded) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      if (result?.succeeded) {
        toast.success("Course topic updated successfully!");
        queryClient.invalidateQueries(["courseTopics"]);
      } else {
        toast.error(result?.message || "Failed to update topic.");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update course topic.");
    },
  });
};

export default useUpdateCourseTopic;
