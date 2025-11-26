import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../web-api-client.ts";

const useGetLearningSidebar = (courseId) => {
  return useQuery({
    queryKey: ["learningSidebar", courseId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      return await client.getLearningSidebarByCourseId(courseId);
    },
  });
}

export default useGetLearningSidebar;