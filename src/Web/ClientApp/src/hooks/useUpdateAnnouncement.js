import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AnnouncementClient, UpdateAnnouncementCommand } from "../web-api-client.ts";
import { useNavigate } from "react-router";
import queryClient from "../configs/reactQuery.js";

const useUpdateAnnouncement = () => {
  const announcementClient = new AnnouncementClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (announcementData) => {
      const command = new UpdateAnnouncementCommand({
        ...announcementData,
      });
      return await announcementClient.updateAnnouncement(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
      navigate("/instructor/communication/announcements", { replace: true });
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to update announcement. Please try again.";
      toast.error(msg);
    },
  });
};

export default useUpdateAnnouncement;
