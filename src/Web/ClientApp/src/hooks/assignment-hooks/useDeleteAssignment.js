import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentsClient } from "../../web-api-client.ts";

const useDeleteAssignment = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, courseId, itemId }) => {
      const client = new AssignmentsClient();
      return await client.deleteAssignment(assignmentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.courseId, variables.itemId] });
    },
  });
};

export default useDeleteAssignment;
