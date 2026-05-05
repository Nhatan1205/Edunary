import { useEffect, useState } from "react";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

/**
 * useRoadmapProgress
 *
 * Listens for "Roadmap.Progress:{userId}" SignalR events.
 * Returns the latest { percent, message, roadmapId } received from the server.
 * Backend is responsible for the pacing (delays between milestones).
 *
 * Special: percent === -1 signals an error.
 *
 * @param {boolean} active - Only subscribe when actively generating
 */
const useRoadmapProgress = (active = false) => {
  const { on } = useSignalR();
  const [progress, setProgress] = useState({ percent: 0, message: "Initializing...", roadmapId: null });

  const userId = tokenService.getUserId();

  useEffect(() => {
    if (!active || !userId) {
      setProgress({ percent: 0, message: "Initializing...", roadmapId: null });
      return;
    }

    setProgress({ percent: 0, message: "Initializing...", roadmapId: null });

    const cleanup = on(`Roadmap.Progress:${userId}`, (data) => {
      setProgress({
        percent: data.percent,
        message: data.message,
        roadmapId: data.roadmapId ?? null,
      });
    });

    return cleanup;
  }, [active, userId, on]);

  return progress;
};

export default useRoadmapProgress;
