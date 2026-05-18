import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient, CreateAssignmentFeedbackCommand } from "../../web-api-client.ts";

const useCreateAssignmentFeedback = () => {
  return useMutation({
    mutationFn: async ({ submissionId, content }) => {
      const client = new AssignmentSubmissionsClient();
      const command = new CreateAssignmentFeedbackCommand({ submissionId, content });
      return await client.createFeedback(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instructorSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["studentSubmission", variables.submissionId] });
    },
  });
};

export default useCreateAssignmentFeedback;
