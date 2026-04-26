import { useQuery } from "@tanstack/react-query";
import { CourseNotesClient } from "../../web-api-client.ts";

const useGetCourseNotesByVideo = (courseId, videoId) => {
  return useQuery({
    queryKey: ["courseNotes", courseId, videoId],
    queryFn: async () => {
      const client = new CourseNotesClient();
      return await client.getCourseNotesByVideo(courseId, videoId);
    },
    enabled: !!courseId && !!videoId,
  });
};

export default useGetCourseNotesByVideo;
