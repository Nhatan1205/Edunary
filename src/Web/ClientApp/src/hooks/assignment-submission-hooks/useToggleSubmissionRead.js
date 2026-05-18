import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient, ToggleSubmissionReadCommand } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useToggleSubmissionRead = () => {
  return useMutation({
    mutationFn: async ({ submissionId, isRead }) => {
      const client = new AssignmentSubmissionsClient();
      const command = new ToggleSubmissionReadCommand({ submissionId, isRead });
      return await client.toggleRead(submissionId, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorSubmissions"] });
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useToggleSubmissionRead;

