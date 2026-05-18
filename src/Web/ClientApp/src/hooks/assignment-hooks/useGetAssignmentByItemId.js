import { useQuery } from "@tanstack/react-query";
import { AssignmentsClient } from "../../web-api-client.ts";

const useGetAssignmentByItemId = (courseId, itemId, options = {}) => {
  return useQuery({
    queryKey: ["assignment", courseId, itemId],
    queryFn: async () => {
      const client = new AssignmentsClient();
      return await client.getAssignmentByItemId(courseId, itemId);
    },
    enabled: !!courseId && !!itemId && (options.enabled ?? true),
  });
};

export default useGetAssignmentByItemId;
