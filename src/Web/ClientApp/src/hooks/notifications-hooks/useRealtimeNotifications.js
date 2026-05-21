import { useEffect } from "react";
import queryClient from "../../configs/reactQuery.js";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

const useRealtimeNotifications = (userId) => {
  const { on } = useSignalR();
  // Resolve userId — prefer explicit prop, fallback to token claim
  const resolvedUserId = userId || tokenService.getUserId();

  useEffect(() => {
    if (!resolvedUserId) return;

    const cleanup = on(`Notification.New:${resolvedUserId}`, () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return cleanup;
  }, [resolvedUserId, on]);
};

export default useRealtimeNotifications;
