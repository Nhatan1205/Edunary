import { useEffect, useState } from "react";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

/**
 * useQuizGenerateProgress
 *
 * Listens for "Quiz.Generate:{userId}" SignalR events.
 * Returns the latest { percent, message, questions, contentSummary } from the server.
 *
 * Special: percent === -1 signals an error.
 * percent === 100 → questions array is populated.
 *
 * @param {boolean} active - Only subscribe when actively generating
 */
const useQuizGenerateProgress = (active = false) => {
  const { on } = useSignalR();
  const [progress, setProgress] = useState({
    percent: 0,
    message: "Initializing...",
    questions: null,
    contentSummary: "",
  });

  const userId = tokenService.getUserId();

  useEffect(() => {
    if (!active || !userId) {
      setProgress({ percent: 0, message: "Initializing...", questions: null, contentSummary: "" });
      return;
    }

    setProgress({ percent: 0, message: "Initializing...", questions: null, contentSummary: "" });

    const cleanup = on(`Quiz.Generate:${userId}`, (data) => {
      setProgress({
        percent: data.percent,
        message: data.message,
        questions: data.questions ?? null,
        contentSummary: data.contentSummary ?? "",
      });
    });

    return cleanup;
  }, [active, userId, on]);

  return progress;
};

export default useQuizGenerateProgress;
