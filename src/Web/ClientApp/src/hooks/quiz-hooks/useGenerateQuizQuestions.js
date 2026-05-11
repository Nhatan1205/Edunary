import { useMutation } from "@tanstack/react-query";
import { QuizzesClient } from "../../web-api-client.ts";

const client = new QuizzesClient();

/**
 * Fire-and-forget mutation to kick off AI quiz generation.
 * Result is delivered via SignalR "Quiz.Generate:{userId}" event — not via this mutation response.
 */
export default function useGenerateQuizQuestions() {
  return useMutation({
    mutationFn: (payload) => client.generateQuizQuestions(payload),
  });
}
