import { useQuery } from "@tanstack/react-query";
import { AssignmentSubmissionsClient } from "../../web-api-client.ts";

const useGetInstructorSubmissions = (params) => {
  return useQuery({
    queryKey: ["instructorSubmissions", params],
    queryFn: async () => {
      const client = new AssignmentSubmissionsClient();
      return await client.getInstructorSubmissions(
        params.courseId ?? undefined,
        params.pageNumber ?? 1,
        params.pageSize ?? 20,
        params.readFilter ?? "all",
        params.feedbackFilter ?? "all",
        params.sortBy ?? "newestFirst"
      );
    },
  });
};

export default useGetInstructorSubmissions;
