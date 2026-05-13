import { useEffect, useState } from "react";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

/**
 * useCaptionGenerateProgress
 *
 * Listens for "Caption.Generate:{userId}" SignalR events.
 * Returns a map of { [mediaFileId]: { percent, message } } for all active jobs.
 *
 * Special: percent === -1 signals an error (row removed from map).
 * percent === 100 → job complete (row removed from map, caller should invalidate queries).
 *
 * @param {function} onComplete - Called with mediaFileId when a job completes (percent === 100)
 * @param {function} onError    - Called with (mediaFileId, message) when a job fails (percent === -1)
 */
const useCaptionGenerateProgress = (onComplete, onError) => {
  const { on } = useSignalR();
  const [generatingRows, setGeneratingRows] = useState({});

  const userId = tokenService.getUserId();

  useEffect(() => {
    if (!userId) return;

    const cleanup = on(`Caption.Generate:${userId}`, (data) => {
      const { mediaFileId, percent, message } = data;
      if (!mediaFileId) return;

      if (percent >= 100) {
        setGeneratingRows((prev) => {
          const next = { ...prev };
          delete next[mediaFileId];
          return next;
        });
        onComplete?.(mediaFileId);
      } else if (percent < 0) {
        setGeneratingRows((prev) => {
          const next = { ...prev };
          delete next[mediaFileId];
          return next;
        });
        onError?.(mediaFileId, message);
      } else {
        setGeneratingRows((prev) => ({
          ...prev,
          [mediaFileId]: { percent, message: message || "Generating..." },
        }));
      }
    });

    return cleanup;
  }, [userId, on, onComplete, onError]);

  return { generatingRows, setGeneratingRows };
};

export default useCaptionGenerateProgress;
