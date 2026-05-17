import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentsClient, UpdateAssignmentCommand } from "../../web-api-client.ts";

const useUpdateAssignment = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, title, description, instructions, estimatedDurationMinutes }) => {
      const client = new AssignmentsClient();
      const command = new UpdateAssignmentCommand({
        assignmentId,
        title,
        description,
        instructions,
        estimatedDurationMinutes,
      });
      return await client.updateAssignment(assignmentId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.assignmentId] });
    },
  });
};

export default useUpdateAssignment;
