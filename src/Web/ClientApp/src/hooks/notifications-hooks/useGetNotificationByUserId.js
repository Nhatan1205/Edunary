import { useQuery } from "@tanstack/react-query";
import { NotificationClient } from "../../web-api-client.ts";
import { useAuth } from "../../context/AuthContext.jsx";

const useGetNotificationsByUserId = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["notifications"], // key duy nhất để react-query cache
    queryFn: async () => {
      const notificationClient = new NotificationClient();
      const result = await notificationClient.getNotficationsByUserId();

      if (!result) {
        throw new Error("Failed to fetch notifications");
      }

      return result; // có thể là NotificationsVm (theo class bạn đã định nghĩa)
    },
    enabled: isAuthenticated,
  });
};

export default useGetNotificationsByUserId;
