import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { AssignmentSubmissionsClient, UpsertAssignmentSubmissionCommand, SubmitAnswerDto } from "../../web-api-client.ts";

const useUpsertAssignmentSubmission = () => {
  return useMutation({
    mutationFn: async ({ assignmentId, answers, action }) => {
      const client = new AssignmentSubmissionsClient();
      const answerDtos = answers.map(a => new SubmitAnswerDto({ questionId: a.questionId, answerText: a.answerText }));
      const command = new UpsertAssignmentSubmissionCommand({
        assignmentId,
        answers: answerDtos,
        action,
      });
      return await client.upsert(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignmentDraft", variables.assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["assignment"] });
    },
  });
};

export default useUpsertAssignmentSubmission;
