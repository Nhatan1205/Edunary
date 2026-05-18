import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient } from "../../web-api-client.ts";

const useDeleteAssignmentFeedback = () => {
  return useMutation({
    mutationFn: async ({ feedbackId }) => {
      const client = new AssignmentSubmissionsClient();
      return await client.deleteFeedback(feedbackId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studentSubmission", variables.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["instructorSubmissions"] });
    },
  });
};

export default useDeleteAssignmentFeedback;
