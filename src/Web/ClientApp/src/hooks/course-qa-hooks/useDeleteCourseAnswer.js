import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { CourseAnswersClient } from "../../web-api-client.ts";

const useDeleteCourseAnswer = () => {
  return useMutation({
    mutationFn: async (answerId) => {
      const client = new CourseAnswersClient();
      return await client.deleteCourseAnswer(answerId);
    },
    onSuccess: () => {
      // toast.success("Answer deleted.");
      queryClient.invalidateQueries({ queryKey: ["courseAnswers"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete answer.");
    },
  });
};

export default useDeleteCourseAnswer;
