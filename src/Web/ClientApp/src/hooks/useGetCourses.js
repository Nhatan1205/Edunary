import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCourses = (searchText = "", filterData = [],pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["courses", searchText, filterData, pageNumber, pageSize],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      
      const query = {
        searchText,
        filterData,
        pageNumber,
        pageSize,
      };
      
      const result = await coursesClient.getCoursesWithPagination(query);

      if (!result) {
        throw new Error("Failed to fetch courses");
      }

      const newItems = result.items.map((course) => {
        let learningObjectives = JSON.parse(course.learningObjectives || "[]");
        let requirements = JSON.parse(course.requirements || "[]");
        let targetAudience = JSON.parse(course.targetAudience || "[]");

        return {
          ...course,
          learningObjectives,
          requirements,
          targetAudience,
        };
      });

      return {
        items: newItems,
        pageNumber: result.pageNumber,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      };
    },
    keepPreviousData: true,
  });
};

export default useGetCourses;