import { useMutation } from "@tanstack/react-query";
import { QuizzesClient, DeleteQuizCommand } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useDeleteQuiz = () => {
  return useMutation({
    mutationFn: async ({ quizIds }) => {
      const client = new QuizzesClient();
      return await client.deleteQuiz(new DeleteQuizCommand({ quizIds }));
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteQuiz;
