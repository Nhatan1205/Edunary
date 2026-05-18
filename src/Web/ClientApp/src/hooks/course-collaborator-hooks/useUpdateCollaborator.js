import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient, UpdateCollaboratorCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useUpdateCollaborator = (courseId) => {
  return useMutation({
    mutationFn: async ({ collaboratorId, ...data }) => {
      const client = new CourseCollaboratorsClient();
      return await client.updateCollaborator(
        courseId,
        collaboratorId,
        new UpdateCollaboratorCommand({ courseId, collaboratorId, ...data })
      );
    },
    onSuccess: () => {
      toast.success("Collaborator updated.");
      queryClient.invalidateQueries(["collaborators", courseId]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export default useUpdateCollaborator;
