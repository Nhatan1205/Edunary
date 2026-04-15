import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  SystemSettingsClient,
  UpdateSystemSettingsCommand,
  UpdateSettingItem,
} from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateSystemSettings = () => {
  const client = new SystemSettingsClient();

  return useMutation({
    mutationFn: async (settings) => {
      const items = settings.map(
        (s) => new UpdateSettingItem({ key: s.key, value: s.value })
      );
      const command = new UpdateSystemSettingsCommand({ settings: items });
      return await client.updateSystemSettings(command);
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
    },
    onError: (error) => {
      toast.error(error?.response || error?.message || "Failed to update settings.");
    },
  });
};

export default useUpdateSystemSettings;
