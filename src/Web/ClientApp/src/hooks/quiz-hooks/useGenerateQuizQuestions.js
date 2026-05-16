import { useMutation } from "@tanstack/react-query";
import { QuizzesClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const client = new QuizzesClient();

/**
 * Fire-and-forget mutation to kick off AI quiz generation.
 * Result is delivered via SignalR "Quiz.Generate:{userId}" event — not via this mutation response.
 */
export default function useGenerateQuizQuestions() {
  return useMutation({
    mutationFn: (payload) => client.generateQuizQuestions(payload),
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to start AI quiz generation.");
    },
  });
}
