import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCoursesWithFilter = (queries = null, categoryId = null) => {
  return useQuery({
    queryKey: ["courses", "filter", queries, categoryId],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCoursesWithFilter(
        queries,
        categoryId
      );

      if (!result) {
        throw new Error("Failed to fetch courses");
      }

      const newItems = result.map((course) => {
        let learningObjectives = JSON.parse(course.learningObjectives || "[]");

        return {
          ...course,
          learningObjectives,
        };
      });

      return newItems;
    },
    enabled: queries !== null || categoryId !== null, // Chỉ chạy query khi có filter
  });
};

export default useGetCoursesWithFilter;