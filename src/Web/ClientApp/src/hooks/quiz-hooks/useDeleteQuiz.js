import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient } from "../../web-api-client.ts";

const useDeleteQuiz = () => {
  return useMutation({
    mutationFn: async ({ quizId, courseId, itemId }) => {
      const client = new QuizzesClient();
      return await client.deleteQuiz(quizId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.courseId, variables.itemId] });
    },
  });
};

export default useDeleteQuiz;
