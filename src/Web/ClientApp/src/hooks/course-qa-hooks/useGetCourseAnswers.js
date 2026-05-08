import { useQuery } from "@tanstack/react-query";
import { CourseAnswersClient } from "../../web-api-client.ts";

const useGetCourseAnswers = (questionId, pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["courseAnswers", questionId, pageNumber, pageSize],
    queryFn: async () => {
      const client = new CourseAnswersClient();
      return await client.getCourseAnswers(questionId, pageNumber, pageSize);
    },
    enabled: !!questionId,
  });
};

export default useGetCourseAnswers;
