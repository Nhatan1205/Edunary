import { useMutation } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

export const useAcceptInvitation = () => {
  return useMutation({
    mutationFn: async (collaboratorId) => {
      const client = new CourseCollaboratorsClient();
      return await client.acceptInvitation(collaboratorId);
    },
    onSuccess: () => {
      toast.success("Invitation accepted! The course has been added to your list.");
      queryClient.invalidateQueries(["my-invitations"]);
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
};

export const useDeclineInvitation = () => {
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
