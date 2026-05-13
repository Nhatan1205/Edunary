import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { NotificationClient } from "../../web-api-client.ts";

const useGetNotificationsByUserId = ({ pageNumber = 1, pageSize = 8, status = "all" } = {}) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["notifications", { pageNumber, pageSize, status }],
    queryFn: async () => {
      const client = new NotificationClient();
      return await client.getNotficationsByUserId(pageNumber, pageSize, status);
    },
    enabled: isAuthenticated,
    keepPreviousData: true,
  });
};

export default useGetNotificationsByUserId;
