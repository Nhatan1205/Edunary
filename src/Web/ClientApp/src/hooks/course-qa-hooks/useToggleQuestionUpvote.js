import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useToggleQuestionUpvote = () => {
  return useMutation({
    mutationFn: async (questionId) => {
      const client = new CourseQuestionsClient();
      return await client.toggleQuestionUpvote(questionId);
    },
    onSuccess: (_data, questionId) => {
      // queryClient.invalidateQueries({ queryKey: ["courseQuestions"] });
    },
  });
};

export default useToggleQuestionUpvote;
