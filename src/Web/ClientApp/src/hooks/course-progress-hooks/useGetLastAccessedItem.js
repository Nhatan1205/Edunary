import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../../web-api-client.ts";

const useGetLastAccessedItem = (courseId) => {
  return useQuery({
    queryKey: ["courseProgress", "lastAccessedItem", courseId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      return await client.getLastAccessedItem(courseId);
    },
    enabled: !!courseId,
  });
}
export default useGetLastAccessedItem;