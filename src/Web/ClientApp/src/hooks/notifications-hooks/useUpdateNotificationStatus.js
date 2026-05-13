import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  NotificationClient,
  UpdateNotificationStatusCommand,
} from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateNotificationStatus = () => {
  const notificationClient = new NotificationClient();

  return useMutation({
    mutationFn: async (ids) => {

      const command = new UpdateNotificationStatusCommand({ ids });

      return await notificationClient.updateNotificationStatus(command);
    },
    onSuccess: () => {
      // toast.success("Notification status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
