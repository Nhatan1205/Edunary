import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCoursesAuthor = (searchText = "",sortBy = 0,pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["courses",searchText,sortBy, pageNumber, pageSize],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCoursesAuthorWithPagination(
        searchText,
        sortBy,
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
  });
};

export default useGetCoursesAuthor;
