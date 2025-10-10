import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCourses = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["courses", pageNumber, pageSize],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCoursesWithPagination(
        pageNumber,
        pageSize,
      );

      if (!result) {
        throw new Error("Failed to fetch courses");
      }

      return {
        items: result.items,
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
