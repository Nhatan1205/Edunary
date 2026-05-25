import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetCourseReviewSubmissionsCounts = (params) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["course-review-submissions-counts", params],
    queryFn: async () => {
      const result = await client.getCourseReviewSubmissionsCounts(
        params?.isFirstSubmissionOnly,
        params?.searchQuery
      );
      if (!result) throw new Error("Failed to fetch review submission counts");
      return result;
    },
    staleTime: 30 * 1000, // cache for 30s
  });
};

export default useGetCourseReviewSubmissionsCounts;
