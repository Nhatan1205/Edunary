import { useQuery } from "@tanstack/react-query";
import { AnnouncementClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetAnnouncementById = (id) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["announcement", id],
    queryFn: async () => {
      const announcementClient = new AnnouncementClient();
      const result = await announcementClient.getAnnouncementById(id);

      if (!result || !result.id) {
        navigate("/instructor/communication/announcements");
        throw new Error("Failed to fetch announcement information");
      }

      return result;
    },
    enabled: !!id,
  });
};

export default useGetAnnouncementById;
