import { useQuery } from "@tanstack/react-query";
import { AssignmentSubmissionsClient } from "../../web-api-client.ts";

const useGetStudentSubmission = (submissionId) => {
  return useQuery({
    queryKey: ["studentSubmission", submissionId],
    queryFn: async () => {
      const client = new AssignmentSubmissionsClient();
      return await client.getStudentSubmission(submissionId);
    },
    enabled: !!submissionId,
  });
};

export default useGetStudentSubmission;
