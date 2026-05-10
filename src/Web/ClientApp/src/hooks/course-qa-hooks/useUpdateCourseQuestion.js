import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient, UpdateCourseQuestionCommand } from "../../web-api-client.ts";

const useUpdateCourseQuestion = () => {
  return useMutation({
    mutationFn: async ({ questionId, title, detail }) => {
      const client = new CourseQuestionsClient();
      const command = new UpdateCourseQuestionCommand({ questionId, title, detail });
      return await client.updateCourseQuestion(questionId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courseQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["instructorQuestions"] });
    },
  });
};

export default useUpdateCourseQuestion;
