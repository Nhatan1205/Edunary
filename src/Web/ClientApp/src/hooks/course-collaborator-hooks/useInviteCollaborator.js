import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient, InviteCollaboratorCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useInviteCollaborator = (courseId) => {
  return useMutation({
    mutationFn: async (data) => {
      const client = new CourseCollaboratorsClient();
      return await client.inviteCollaborator(
        courseId,
        new InviteCollaboratorCommand({ courseId, ...data })
      );
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries(["collaborators", courseId]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export default useInviteCollaborator;
