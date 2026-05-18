import { useQuery } from "@tanstack/react-query";
import { AssignmentSubmissionsClient } from "../../web-api-client.ts";

const useGetAssignmentDraft = (assignmentId) => {
  return useQuery({
    queryKey: ["assignmentDraft", assignmentId],
    queryFn: async () => {
      const client = new AssignmentSubmissionsClient();
      return await client.getDraft(assignmentId);
    },
    enabled: !!assignmentId,
  });
};

export default useGetAssignmentDraft;
