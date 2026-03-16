import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetPublicCoursesByUserId = (userId, pageNumber = 1, pageSize = 9) => {
  return useQuery({
    queryKey: ["publicCoursesByUser", userId, pageNumber, pageSize],
    queryFn: async () => {
      if (!userId) throw new Error("userId is required");

      const coursesClient = new CoursesClient();

      const result = await coursesClient.getPublicCoursesByUserId(
        userId,
        pageNumber,
        pageSize
      );

      if (!result) {
        throw new Error("Failed to fetch public courses");
      }

      return {
        items: result.items ?? [],
        pageNumber: result.pageNumber,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      };
    },
    enabled: !!userId,
  });
};

export default useGetPublicCoursesByUserId;