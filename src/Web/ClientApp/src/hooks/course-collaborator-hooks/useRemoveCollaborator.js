import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useRemoveCollaborator = (courseId) => {
  return useMutation({
    mutationFn: async (collaboratorId) => {
      const client = new CourseCollaboratorsClient();
      return await client.removeCollaborator(courseId, collaboratorId);
    },
    onSuccess: () => {
      toast.success("Collaborator removed.");
      queryClient.invalidateQueries(["collaborators", courseId]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export default useRemoveCollaborator;
