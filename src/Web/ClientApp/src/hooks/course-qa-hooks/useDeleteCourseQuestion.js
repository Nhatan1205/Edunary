import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseQuestionsClient } from "../../web-api-client.ts";

const useDeleteCourseQuestion = () => {
  return useMutation({
    mutationFn: async (questionId) => {
      const client = new CourseQuestionsClient();
      return await client.deleteCourseQuestion(questionId);
    },
    onSuccess: () => {
      // toast.success("Question deleted.");
      queryClient.invalidateQueries({ queryKey: ["courseQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["instructorQuestions"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete question.");
    },
  });
};

export default useDeleteCourseQuestion;
