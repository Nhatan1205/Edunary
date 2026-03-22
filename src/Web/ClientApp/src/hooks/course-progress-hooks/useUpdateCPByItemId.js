import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseProgressClient, UpdateCPByItemIdCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateCPByItemId = () => {
  const courseProgressClient = new CourseProgressClient();
  return useMutation({
    mutationFn: async ({ itemId, courseId, isCompleted, lastPosition }) => {
      const command = new UpdateCPByItemIdCommand({
        itemId: itemId,
        courseId: courseId,
        isCompleted: isCompleted,
        lastPosition: lastPosition,
      });
      return courseProgressClient.updateCPByItemId(command);
    },
    onSuccess: (data, variables) => {
      const itemCacheKey = ["courseProgress", "item", variables.courseId, variables.itemId];
      const cachedData = queryClient.getQueryData(itemCacheKey);
      const wasCompletedBefore = cachedData?.currentItem?.isCompleted || false;
      const isJustFinished = !wasCompletedBefore && variables.isCompleted;
      if (isJustFinished) {
        queryClient.invalidateQueries(["learningSidebar", variables.courseId]);
        queryClient.invalidateQueries(["learningHeader", variables.courseId]);
        queryClient.invalidateQueries(["courseProgress", "item", variables.courseId, variables.itemId]);
      }
      else {
        if (cachedData) {
          queryClient.setQueryData(itemCacheKey, {
            ...cachedData,
            currentItem: {
              ...cachedData.currentItem,
              lastPosition: variables.lastPosition
            }
          });
        }
      }
    },
    onError: (error) => {
      toast.error(`Error updating course progress: ${error.message}`);
    }
  });
}
export default useUpdateCPByItemId;