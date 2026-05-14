import { useQuery } from "@tanstack/react-query";
import { AnnouncementClient } from "../../web-api-client.ts";

const useGetAnnouncementsByCourseId = (courseId, pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["announcements", "course", courseId, pageNumber, pageSize],
    queryFn: async () => {
      const client = new AnnouncementClient();
      const result = await client.getAnnouncementsByCourseId(courseId, pageNumber, pageSize);
      if (!result) throw new Error("Failed to fetch announcements");
      return result;
    },
    enabled: !!courseId,
    keepPreviousData: true,
  });
};

export default useGetAnnouncementsByCourseId;
