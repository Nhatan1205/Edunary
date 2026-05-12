import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseAnswersClient, CreateCourseAnswerCommand } from "../../web-api-client.ts";

const useCreateCourseAnswer = () => {
  return useMutation({
    mutationFn: async ({ questionId, body }) => {
      const client = new CourseAnswersClient();
      const command = new CreateCourseAnswerCommand({ questionId, body });
      return await client.createCourseAnswer(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courseAnswers", variables.questionId] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to post answer.");
    },
  });
};

export default useCreateCourseAnswer;
