import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizAttemptsClient, SubmitQuizAttemptCommand, SubmitAnswerDto } from "../../web-api-client.ts";

const useSubmitQuizAttempt = () => {
  return useMutation({
    mutationFn: async ({ attemptId, answers }) => {
      const client = new QuizAttemptsClient();
      const command = new SubmitQuizAttemptCommand({
        attemptId,
        answers: answers.map((a) =>
          new SubmitAnswerDto({
            questionId: a.questionId,
            selectedChoiceIds: a.selectedChoiceIds,
          })
        ),
      });
      return await client.submitAttempt(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attemptHistory"] });
    },
  });
};

export default useSubmitQuizAttempt;
