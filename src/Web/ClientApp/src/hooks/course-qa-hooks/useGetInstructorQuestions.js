import { useQuery } from "@tanstack/react-query";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useGetInstructorQuestions = (params) => {
  return useQuery({
    queryKey: ["instructorQuestions", params],
    queryFn: async () => {
      const client = new CourseQuestionsClient();
      return await client.getInstructorQuestions(
        params.courseId ?? undefined,
        params.searchText ?? undefined,
        params.sortBy ?? "newestFirst",
        params.filterBy ?? "all",
        params.pageNumber ?? 1,
        params.pageSize ?? 20
      );
    },
  });
};

export default useGetInstructorQuestions;
