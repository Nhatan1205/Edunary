import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient, LinkQuizToItemCommand } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useLinkQuizToItem = () => {
  return useMutation({
    mutationFn: async ({ quizId, courseId, newItemId, relatedItemId }) => {
      const client = new QuizzesClient();
      const command = new LinkQuizToItemCommand({
        quizId,
        courseId,
        newItemId,
        relatedItemId,
      });
      return await client.linkQuizToItem(quizId, command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes-by-course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.courseId, variables.newItemId] });
      toast.success("Quiz linked successfully!");
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to link quiz.");
    },
  });
};

export default useLinkQuizToItem;
