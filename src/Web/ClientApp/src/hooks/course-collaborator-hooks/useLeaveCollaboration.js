import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useLeaveCollaboration = () => {
  return useMutation({
    mutationFn: async (courseId) => {
      const client = new CourseCollaboratorsClient();
      return await client.leaveCollaboration(courseId);
    },
    onSuccess: () => {
      toast.success("You have left the course collaboration.");
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export default useLeaveCollaboration;
