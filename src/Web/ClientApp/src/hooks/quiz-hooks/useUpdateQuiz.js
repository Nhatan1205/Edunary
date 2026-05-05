import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient, UpdateQuizCommand } from "../../web-api-client.ts";

const useUpdateQuiz = () => {
  return useMutation({
    mutationFn: async ({ quizId, title, description, relatedItemId, timeLimitMinutes, passingScore, maxAttempts, showCorrectAnswers, randomizeQuestions }) => {
      const client = new QuizzesClient();
      const command = new UpdateQuizCommand({
        quizId,
        title,
        description,
        relatedItemId,
        timeLimitMinutes,
        passingScore,
        maxAttempts,
        showCorrectAnswers,
        randomizeQuestions,
      });
      return await client.updateQuiz(quizId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.quizId] });
    },
  });
};

export default useUpdateQuiz;
