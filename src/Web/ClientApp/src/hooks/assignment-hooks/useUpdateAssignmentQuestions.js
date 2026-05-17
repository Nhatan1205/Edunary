import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import {
  AssignmentsClient,
  UpdateAssignmentQuestionsCommand,
  AssignmentQuestionDto,
} from "../../web-api-client.ts";

const useUpdateAssignmentQuestions = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, questions }) => {
      const client = new AssignmentsClient();
      const command = new UpdateAssignmentQuestionsCommand({
        assignmentId,
        questions: questions.map(
          (q) =>
            new AssignmentQuestionDto({
              id: q.id ?? undefined,
              questionText: q.questionText,
              exampleAnswer: q.exampleAnswer,
              sortOrder: q.sortOrder,
            })
        ),
      });
      return await client.updateAssignmentQuestions(assignmentId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignment", variables.assignmentId] });
    },
  });
};

export default useUpdateAssignmentQuestions;
