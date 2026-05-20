import { useQuery } from "@tanstack/react-query";
import { EnrollmentClient } from "../../web-api-client.ts";

const useGetInstructorStudents = (params) => {
  return useQuery({
    queryKey: ["instructorStudents", params],
    queryFn: async () => {
      const client = new EnrollmentClient();
      return await client.getInstructorStudents(
        params.courseId ?? undefined,
        params.searchText ?? undefined,
        params.sortBy ?? "newest",
        params.pageNumber ?? 1,
        params.pageSize ?? 10
      );
    },
  });
};

export default useGetInstructorStudents;
