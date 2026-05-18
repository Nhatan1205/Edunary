import { useMutation } from "@tanstack/react-query";
import { AssignmentsClient, DeleteAssignmentCommand } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useDeleteAssignment = () => {
  return useMutation({
    mutationFn: async ({ assignmentIds }) => {
      const client = new AssignmentsClient();
      return await client.deleteAssignment(new DeleteAssignmentCommand({ assignmentIds }));
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteAssignment;
