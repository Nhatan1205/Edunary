import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseAnswersClient, UpdateCourseAnswerCommand } from "../../web-api-client.ts";

const useUpdateCourseAnswer = () => {
  return useMutation({
    mutationFn: async ({ answerId, body }) => {
      const client = new CourseAnswersClient();
      const command = new UpdateCourseAnswerCommand({ answerId, body });
      return await client.updateCourseAnswer(answerId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courseAnswers"] });
    },
  });
};

export default useUpdateCourseAnswer;
