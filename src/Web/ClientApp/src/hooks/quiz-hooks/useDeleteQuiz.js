import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useDeleteQuiz = () => {
  return useMutation({
    mutationFn: async ({ quizId, courseId, itemId }) => {
      const client = new QuizzesClient();
      return await client.deleteQuiz(quizId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.courseId, variables.itemId] });
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteQuiz;
