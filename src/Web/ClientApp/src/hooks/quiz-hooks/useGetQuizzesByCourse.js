import { useQuery } from "@tanstack/react-query";
import { QuizzesClient } from "../../web-api-client.ts";

const useGetQuizzesByCourse = (courseId) => {
  return useQuery({
    queryKey: ["quizzes-by-course", courseId],
    queryFn: async () => {
      const client = new QuizzesClient();
      return await client.getQuizzesByCourse(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetQuizzesByCourse;
