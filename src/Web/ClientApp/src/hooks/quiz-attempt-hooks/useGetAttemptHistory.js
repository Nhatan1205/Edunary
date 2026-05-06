import { useQuery } from "@tanstack/react-query";
import { QuizAttemptsClient } from "../../web-api-client.ts";

const useGetAttemptHistory = (quizId) => {
  return useQuery({
    queryKey: ["attemptHistory", quizId],
    queryFn: async () => {
      const client = new QuizAttemptsClient();
      return await client.getAttemptHistory(quizId);
    },
    enabled: !!quizId,
  });
};

export default useGetAttemptHistory;
