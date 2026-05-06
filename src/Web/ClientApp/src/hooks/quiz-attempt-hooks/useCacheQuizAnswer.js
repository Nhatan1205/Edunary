import { useMutation } from "@tanstack/react-query";
import { QuizAttemptsClient, CacheQuizAnswerCommand } from "../../web-api-client.ts";

const useCacheQuizAnswer = () => {
  return useMutation({
    mutationFn: async ({ attemptId, quizId, questionId, selectedChoiceIds }) => {
      const client = new QuizAttemptsClient();
      const command = new CacheQuizAnswerCommand({
        attemptId,
        quizId,
        questionId,
        selectedChoiceIds,
      });
      return await client.cacheAnswer(command);
    },
  });
};

export default useCacheQuizAnswer;
