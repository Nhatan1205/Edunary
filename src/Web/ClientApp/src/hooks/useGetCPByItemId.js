import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../web-api-client.ts";

const useGetCPByItemId = (itemId, courseId) => {
  return useQuery({
    queryKey: ["courseProgress", "item", courseId, itemId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      return await client.getCPByItemId(itemId, courseId);
    },
  });
}
export default useGetCPByItemId;