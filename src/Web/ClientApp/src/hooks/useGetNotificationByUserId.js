import { useQuery } from "@tanstack/react-query";
import { NotificationClient } from "../web-api-client.ts";

const useGetNotificationsByUserId = () => {
  return useQuery({
    queryKey: ["notifications"], // key duy nhất để react-query cache
    queryFn: async () => {
      const notificationClient = new NotificationClient();
      const result = await notificationClient.getNotficationsByUserId();
      console.log("result notfications", result);

      if (!result) {
        throw new Error("Failed to fetch notifications");
      }

      return result; // có thể là NotificationsVm (theo class bạn đã định nghĩa)
    },
  });
};

export default useGetNotificationsByUserId;
