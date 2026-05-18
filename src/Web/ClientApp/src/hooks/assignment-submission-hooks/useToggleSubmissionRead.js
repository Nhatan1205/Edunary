import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient, ToggleSubmissionReadCommand } from "../../web-api-client.ts";

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
  });
};

export default useToggleSubmissionRead;
