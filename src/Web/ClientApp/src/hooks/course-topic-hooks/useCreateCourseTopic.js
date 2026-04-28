import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseTopicsClient, CreateCourseTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useCreateCourseTopic = () => {
  const client = new CourseTopicsClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new CreateCourseTopicCommand({ name: data.name });
      return await client.createCourseTopic(command);
    },
    onSuccess: (response) => {
      if (response?.result) {
        toast.success("Course topic created successfully!");
        queryClient.invalidateQueries(["courseTopics"]);
      } else {
        toast.error(response?.message || "Failed to create topic.");
      }
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create course topic.");
    },
  });
};

export default useCreateCourseTopic;
