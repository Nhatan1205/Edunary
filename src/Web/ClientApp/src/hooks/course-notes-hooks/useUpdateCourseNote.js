import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseNotesClient, UpdateCourseNoteCommand } from "../../web-api-client.ts";

const useUpdateCourseNote = (courseId, videoId) => {
  return useMutation({
    mutationFn: async ({ noteId, timestampSeconds, content }) => {
      const client = new CourseNotesClient();
      const command = new UpdateCourseNoteCommand({
        noteId,
        timestampSeconds,
        content,
      });
      return await client.updateCourseNote(noteId, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courseNotes", courseId, videoId],
      });
    },
  });
};

export default useUpdateCourseNote;
