import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";
const useGetCoursesStudent = (pageNumber = 1, pageSize = 10,enabled = true) => {

  return useQuery({
    queryKey: ["courses", pageNumber, pageSize],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getEnrolledCoursesWithPagination(
        pageNumber,
        pageSize,
      );

      if (!result) {
        throw new Error("Failed to fetch courses information");
      }

      return {
        items: result.items || [],
        pageNumber: result.pageNumber,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      };
    },
    enabled,
  });
};

export default useGetCoursesStudent;
