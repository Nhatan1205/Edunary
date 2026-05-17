import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentsClient, LinkAssignmentToItemCommand } from "../../web-api-client.ts";

const useLinkAssignmentToItem = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, courseId, newItemId }) => {
      const client = new AssignmentsClient();
      const command = new LinkAssignmentToItemCommand({
        assignmentId,
        itemId: newItemId,
      });
      return await client.linkAssignmentToItem(assignmentId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignments-by-course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.courseId, variables.newItemId] });
    },
  });
};

export default useLinkAssignmentToItem;
