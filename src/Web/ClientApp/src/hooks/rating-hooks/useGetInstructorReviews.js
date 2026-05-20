import { useQuery } from "@tanstack/react-query";
import { RatingCourseClient } from "../../web-api-client.ts";

const useGetInstructorReviews = (params) => {
  return useQuery({
    queryKey: ["instructorReviews", params],
    queryFn: async () => {
      const client = new RatingCourseClient();
      return await client.getInstructorReviews(
        params.pageNumber,
        params.pageSize,
        params.courseId,
        params.rating,
        params.notAnswered,
        params.hasComment,
        params.sortBy
      );
    },
    enabled: true,
    retry: 1,
  });
};

export default useGetInstructorReviews;
