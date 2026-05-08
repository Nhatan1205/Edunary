import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient, CreateCourseQuestionCommand } from "../../web-api-client.ts";

const useCreateCourseQuestion = () => {
  return useMutation({
    mutationFn: async ({ courseId, itemId, title, detail }) => {
      const client = new CourseQuestionsClient();
      const command = new CreateCourseQuestionCommand({ courseId, itemId, title, detail });
      return await client.createCourseQuestion(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courseQuestions", { courseId: variables.courseId }] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to post question.");
    },
  });
};

export default useCreateCourseQuestion;
