import { useQuery } from "@tanstack/react-query";
import { QuizAttemptsClient } from "../../web-api-client.ts";

const useGetCachedAnswers = (attemptId, quizId) => {
  return useQuery({
    queryKey: ["cachedAnswers", attemptId, quizId],
    queryFn: async () => {
      const client = new QuizAttemptsClient();
      return await client.getCachedAnswers(attemptId, quizId);
    },
    enabled: !!attemptId && !!quizId,
    staleTime: 0, // always re-fetch to get latest cached state on resume
  });
};

export default useGetCachedAnswers;
