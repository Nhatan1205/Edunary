import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  NotificationClient,
  UpdateNotificationStatusCommand,
} from "../web-api-client.ts";
import queryClient from "../configs/reactQuery.js";

const useUpdateNotificationStatus = () => {
  const notificationClient = new NotificationClient();

  return useMutation({
    mutationFn: async (notificationData) => {
      const command = new UpdateNotificationStatusCommand({
        ...notificationData, // notificationData chỉ cần { id: number }
      });

      return await notificationClient.updateNotificationStatus(command);
    },
    onSuccess: (_, variables) => {
      // toast.success("Notification status updated successfully!");
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to update notification status. Please try again.";
      toast.error(msg);
    },
  });
};

export default useUpdateNotificationStatus;
