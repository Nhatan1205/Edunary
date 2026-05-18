import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

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
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteAssignmentFeedback;

