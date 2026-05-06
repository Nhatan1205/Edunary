import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { QuizzesClient, LinkQuizToItemCommand } from "../../web-api-client.ts";

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
    },
  });
};

export default useLinkQuizToItem;
