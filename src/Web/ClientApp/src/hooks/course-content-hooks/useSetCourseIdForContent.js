import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseContentClient, SetCourseIdForContentCommand } from "../../web-api-client.ts";

const useSetCourseIdForContent = () => {
  return useMutation({
    mutationFn: async ({ contentIds, courseId }) => {
      const client = new CourseContentClient();
      const command = new SetCourseIdForContentCommand({
        contentIds: Array.isArray(contentIds) ? contentIds : [contentIds],
        courseId: courseId
      });
      return await client.setCourseIdForContent(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseContents"] });
    },
  });
}
export default useSetCourseIdForContent;