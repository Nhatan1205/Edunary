import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient, CreateQuizCommand } from "../../web-api-client.ts";

const useCreateQuiz = () => {
  return useMutation({
    mutationFn: async ({ courseId, itemId, title, description, relatedItemId, timeLimitMinutes, passingScore, maxAttempts, showCorrectAnswers, randomizeQuestions }) => {
      const client = new QuizzesClient();
      const command = new CreateQuizCommand({
        courseId,
        itemId,
        title,
        description,
        relatedItemId,
        timeLimitMinutes,
        passingScore,
        maxAttempts,
        showCorrectAnswers,
        randomizeQuestions,
      });
      return await client.createQuiz(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.courseId, variables.itemId] });
    },
  });
};

export default useCreateQuiz;
