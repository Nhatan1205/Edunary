import { useQuery } from "@tanstack/react-query";
import { QuizzesClient } from "../../web-api-client.ts";

const useGetQuizByItemId = (courseId, itemId) => {
  return useQuery({
    queryKey: ["quiz", courseId, itemId],
    queryFn: async () => {
      const client = new QuizzesClient();
      return await client.getQuizByItemId(courseId, itemId);
    },
    enabled: !!courseId && !!itemId,
  });
};

export default useGetQuizByItemId;
