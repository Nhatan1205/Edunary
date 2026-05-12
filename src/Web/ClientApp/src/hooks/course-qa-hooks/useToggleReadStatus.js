import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useToggleReadStatus = () => {
  return useMutation({
    mutationFn: async (questionId) => {
      const client = new CourseQuestionsClient();
      return await client.toggleReadStatus(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorQuestions"] });
    },
  });
};

export default useToggleReadStatus;
