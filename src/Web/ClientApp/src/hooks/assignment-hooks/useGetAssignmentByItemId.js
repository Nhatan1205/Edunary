import { useQuery } from "@tanstack/react-query";
import { AssignmentsClient } from "../../web-api-client.ts";

const useGetAssignmentByItemId = (courseId, itemId) => {
  return useQuery({
    queryKey: ["assignment", courseId, itemId],
    queryFn: async () => {
      const client = new AssignmentsClient();
      return await client.getAssignmentByItemId(courseId, itemId);
    },
    enabled: !!courseId && !!itemId,
  });
};

export default useGetAssignmentByItemId;
