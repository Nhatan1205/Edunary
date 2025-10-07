import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCoursesAuthor = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["coursesAuthor", pageNumber, pageSize],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCoursesAuthorWithPagination(
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
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export default useGetCoursesAuthor;
