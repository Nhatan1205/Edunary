import { useQuery } from "@tanstack/react-query";
import { CourseAssistantsClient } from "../../web-api-client.ts";

const useGetCourseAssistantHistory = (courseId, cursor = null, pageSize = 30, enabled = false) => {
  return useQuery({
    queryKey: ["courseAssistantHistory", courseId, cursor, pageSize],
    queryFn: async () => {
      const client = new CourseAssistantsClient();
      return await client.getHistory(courseId, cursor || undefined, pageSize);
    },
    enabled: enabled && !!courseId,
  });
};

export default useGetCourseAssistantHistory;
