import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseProgressClient, UpdateCompleteCPCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateCompleteCP = () => {
  const courseProgressClient = new CourseProgressClient();
  return useMutation({
    mutationFn: async ({ courseId, itemId, isCompleted }) => {
      const command = new UpdateCompleteCPCommand({
        courseId: courseId,
        itemId: itemId,
        isCompleted: isCompleted,
      });
      return courseProgressClient.updateCompleteCP(command);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["learningSidebar", variables.courseId]);
      queryClient.invalidateQueries(["learningHeader", variables.courseId]);
      queryClient.invalidateQueries(["courseProgress", "item", variables.courseId, variables.itemId]);
    },
    onError: (error) => {
      toast.error(`Error updating complete course progress: ${error.message}`);
    }
  });
}
export default useUpdateCompleteCP;