import { useEffect, useState } from "react";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

const useQualityCheckProgress = (active = false) => {
  const { on } = useSignalR();
  const [progress, setProgress] = useState({
    percent: 0,
    message: "Initializing AI check...",
    reportId: null,
  });

  const userId = tokenService.getUserId();

  useEffect(() => {
    if (!active || !userId) {
      setProgress({ percent: 0, message: "Initializing AI check...", reportId: null });
      return;
    }

    setProgress({ percent: 0, message: "Initializing AI check...", reportId: null });

    const cleanup = on(`QualityCheck.Report:${userId}`, (data) => {
      setProgress({
        percent: data.percent,
        message: data.message,
        reportId: data.reportId ?? null,
      });
    });

    return cleanup;
  }, [active, userId, on]);

  return progress;
};

export default useQualityCheckProgress;
