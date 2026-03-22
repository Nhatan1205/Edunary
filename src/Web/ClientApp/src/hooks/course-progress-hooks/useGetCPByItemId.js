import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetCPByItemId = (itemId, courseId) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["courseProgress", "item", courseId, itemId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      var result = await client.getCPByItemId(itemId, courseId);
      if (!result || !result.currentItem.itemId) {
        navigate("/my-learning");
      }
      return result;
    },
  });
}
export default useGetCPByItemId;