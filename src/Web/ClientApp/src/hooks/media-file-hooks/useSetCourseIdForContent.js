import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { MediaFileClient, SetCourseIdForContentCommand } from "../../web-api-client.ts";

const useSetCourseIdForContent = () => {
  return useMutation({
    mutationFn: async ({ contentIds, courseId }) => {
      const client = new MediaFileClient();
      const command = new SetCourseIdForContentCommand({
        contentIds: Array.isArray(contentIds) ? contentIds : [contentIds],
        courseId: courseId
      });
      return await client.setCourseIdForContent(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    },
  });
}
export default useSetCourseIdForContent;