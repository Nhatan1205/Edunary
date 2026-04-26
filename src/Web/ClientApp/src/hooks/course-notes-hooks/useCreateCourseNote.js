import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseNotesClient, CreateCourseNoteCommand } from "../../web-api-client.ts";

const useCreateCourseNote = () => {
  return useMutation({
    mutationFn: async ({ courseId, videoId, itemId, timestampSeconds, content }) => {
      const client = new CourseNotesClient();
      const command = new CreateCourseNoteCommand({
        courseId,
        videoId,
        itemId,
        timestampSeconds,
        content,
      });
      return await client.createCourseNote(command);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courseNotes", variables.courseId, variables.videoId],
      });
    },
  });
};

export default useCreateCourseNote;
