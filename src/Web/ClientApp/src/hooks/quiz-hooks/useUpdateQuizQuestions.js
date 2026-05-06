import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient, UpdateQuizQuestionsCommand, QuestionDto, ChoiceDto } from "../../web-api-client.ts";

const useUpdateQuizQuestions = () => {
  return useMutation({
    mutationFn: async ({ quizId, questions }) => {
      const client = new QuizzesClient();
      const command = new UpdateQuizQuestionsCommand({
        quizId,
        questions: questions.map((q) =>
          new QuestionDto({
            id: q.id ?? undefined,
            name: q.name,
            type: q.type,
            explanation: q.explanation,
            sortOrder: q.sortOrder,
            choices: q.choices.map((c) =>
              new ChoiceDto({
                id: c.id ?? undefined,
                text: c.text,
                isCorrect: c.isCorrect,
                sortOrder: c.sortOrder,
              })
            ),
          })
        ),
      });
      return await client.updateQuizQuestions(quizId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.quizId] });
    },
  });
};

export default useUpdateQuizQuestions;
