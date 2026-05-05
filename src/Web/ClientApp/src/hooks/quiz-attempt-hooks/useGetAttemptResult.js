import { useQuery } from "@tanstack/react-query";
import { QuizAttemptsClient } from "../../web-api-client.ts";

const useGetAttemptResult = (attemptId) => {
  return useQuery({
    queryKey: ["attemptResult", attemptId],
    queryFn: async () => {
      const client = new QuizAttemptsClient();
      return await client.getAttemptResult(attemptId);
    },
    enabled: !!attemptId,
  });
};

export default useGetAttemptResult;
