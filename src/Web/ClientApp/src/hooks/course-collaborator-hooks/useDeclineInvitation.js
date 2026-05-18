import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useDeclineInvitation = () => {
  return useMutation({
    mutationFn: async (collaboratorId) => {
      const client = new CourseCollaboratorsClient();
      return await client.declineInvitation(collaboratorId);
    },
    onSuccess: () => {
      toast.info("Invitation declined.");
      queryClient.invalidateQueries(["my-invitations"]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export default useDeclineInvitation;
