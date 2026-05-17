import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentsClient, PublishAssignmentCommand } from "../../web-api-client.ts";

const usePublishAssignment = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, isPublished }) => {
      const client = new AssignmentsClient();
      const command = new PublishAssignmentCommand({ assignmentId, isPublished });
      return await client.publishAssignment(assignmentId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.courseId, variables.itemId] });
    },
  });
};

export default usePublishAssignment;
