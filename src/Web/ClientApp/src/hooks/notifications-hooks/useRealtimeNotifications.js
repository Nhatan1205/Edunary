import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignalR } from "../common/useSignalR";
import { tokenService } from "../../utils/tokenService";

const useRealtimeNotifications = (userId) => {
  const { on } = useSignalR();
  const queryClient = useQueryClient();

  // Resolve userId — prefer explicit prop, fallback to token claim
  const resolvedUserId = userId || tokenService.getUserId();

  useEffect(() => {
    if (!resolvedUserId) return;

    const cleanup = on(`Notification.New:${resolvedUserId}`, () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return cleanup;
  }, [resolvedUserId, on, queryClient]);
};

export default useRealtimeNotifications;
