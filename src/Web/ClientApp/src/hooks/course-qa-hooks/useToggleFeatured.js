import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useToggleFeatured = () => {
  return useMutation({
    mutationFn: async (questionId) => {
      const client = new CourseQuestionsClient();
      return await client.toggleFeatured(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorQuestions"] });
    },
  });
};

export default useToggleFeatured;
