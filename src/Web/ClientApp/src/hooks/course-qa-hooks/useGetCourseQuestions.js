import { useQuery } from "@tanstack/react-query";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useGetCourseQuestions = (params) => {
  return useQuery({
    queryKey: ["courseQuestions", params],
    queryFn: async () => {
      const client = new CourseQuestionsClient();
      return await client.getCourseQuestions(
        params.courseId,
        params.itemId ?? undefined,
        params.sortBy ?? "recommended",
        params.filterBy ?? "all",
        params.searchText ?? undefined,
        params.pageNumber ?? 1,
        params.pageSize ?? 20
      );
    },
    enabled: !!params?.courseId,
  });
};

export default useGetCourseQuestions;
