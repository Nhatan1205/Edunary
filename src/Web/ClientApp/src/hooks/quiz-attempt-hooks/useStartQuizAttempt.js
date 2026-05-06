import { useMutation } from "@tanstack/react-query";
import { QuizAttemptsClient } from "../../web-api-client.ts";

const useStartQuizAttempt = () => {
  return useMutation({
    mutationFn: async ({ quizId }) => {
      const client = new QuizAttemptsClient();
      return await client.startAttempt(quizId);
    },
  });
};

export default useStartQuizAttempt;
