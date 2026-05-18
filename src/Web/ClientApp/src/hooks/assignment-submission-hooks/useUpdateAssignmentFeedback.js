import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient, UpdateAssignmentFeedbackCommand } from "../../web-api-client.ts";

const useUpdateAssignmentFeedback = () => {
  return useMutation({
    mutationFn: async ({ feedbackId, submissionId, content }) => {
      const client = new AssignmentSubmissionsClient();
      const command = new UpdateAssignmentFeedbackCommand({ feedbackId, content });
      return await client.updateFeedback(feedbackId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studentSubmission", variables.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["instructorSubmissions"] });
    },
  });
};

export default useUpdateAssignmentFeedback;
