import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { CourseNotesClient } from "../../web-api-client.ts";

const useDeleteCourseNote = (courseId, videoId) => {
  return useMutation({
    mutationFn: async (noteId) => {
      const client = new CourseNotesClient();
      return await client.deleteCourseNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courseNotes", courseId, videoId],
      });
    },
  });
};

export default useDeleteCourseNote;
