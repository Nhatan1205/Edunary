import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentsClient, CreateAssignmentCommand } from "../../web-api-client.ts";

const useCreateAssignment = () => {
  return useMutation({
    mutationFn: async ({ courseId, itemId, title, description, instructions, estimatedDurationMinutes }) => {
      const client = new AssignmentsClient();
      const command = new CreateAssignmentCommand({
        courseId,
        itemId,
        title,
        description,
        instructions,
        estimatedDurationMinutes,
      });
      return await client.createAssignment(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.courseId, variables.itemId] });
    },
  });
};

export default useCreateAssignment;
