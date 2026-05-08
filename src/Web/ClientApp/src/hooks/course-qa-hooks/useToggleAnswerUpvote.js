import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseAnswersClient } from "../../web-api-client.ts";

const useToggleAnswerUpvote = () => {
  return useMutation({
    mutationFn: async (answerId) => {
      const client = new CourseAnswersClient();
      return await client.toggleAnswerUpvote(answerId);
    },
    onSuccess: (_data, _answerId, context) => {
      // queryClient.invalidateQueries({ queryKey: ["courseAnswers"] });
    },
  });
};

export default useToggleAnswerUpvote;
