import { useQuery } from "@tanstack/react-query";
import { AssignmentsClient } from "../../web-api-client.ts";

const useGetAssignmentsByCourse = (courseId) => {
  return useQuery({
    queryKey: ["assignments-by-course", courseId],
    queryFn: async () => {
      const client = new AssignmentsClient();
      return await client.getAssignmentsByCourse(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetAssignmentsByCourse;
