import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseProgressClient, UpdateCourseProgressCommand } from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

const useUpdateCourseProgress = () => {
  const courseProgressClient = new CourseProgressClient();
  return useMutation({
    mutationFn: async ({courseId, progress}) => {
      // console.log('Updating course progress for courseId:', courseId, 'with data:', progressData);
      const command = new UpdateCourseProgressCommand({
        courseId: courseId,
        progress: progress,
      });
      return courseProgressClient.updateCourseProgress(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courseProgress", "learningHeader"]);
    },
    onError: () => {
      toast.error("Failed to update course progress");
    },
  });
};

export default useUpdateCourseProgress;