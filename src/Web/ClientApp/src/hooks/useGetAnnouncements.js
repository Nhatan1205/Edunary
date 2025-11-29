import { useQuery } from "@tanstack/react-query";
import { AnnouncementClient } from "../web-api-client.ts";

const useGetAnnouncements = (status = 0, pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["announcements", status, pageNumber, pageSize],
    queryFn: async () => {
      const announcementClient = new AnnouncementClient();
      
      const result = await announcementClient.getAnnouncements(status, pageNumber, pageSize);

      if (!result) {
        throw new Error("Failed to fetch announcements");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export default useGetAnnouncements;