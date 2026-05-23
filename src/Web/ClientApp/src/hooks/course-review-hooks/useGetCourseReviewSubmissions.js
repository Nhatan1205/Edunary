import { useQuery } from "@tanstack/react-query";
import { CourseReviewsClient } from "../../web-api-client.ts";

const useGetCourseReviewSubmissions = (params) => {
  const client = new CourseReviewsClient();

  return useQuery({
    queryKey: ["pending-review-courses", params],
    queryFn: async () => {
      return await client.getCourseReviewSubmissions(
        params?.pageNumber,
        params?.pageSize,
        params?.status,
        params?.isFirstSubmissionOnly,
        params?.searchQuery,
        params?.sortBy
      );
    },
  });
};

export default useGetCourseReviewSubmissions
  ;
