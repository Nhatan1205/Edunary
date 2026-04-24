import { useQuery } from "@tanstack/react-query";
import { SystemSettingsClient, GetSystemSettingsQuery } from "../../web-api-client.ts";

const useGetSystemSettings = (keys = []) => {
  return useQuery({
    queryKey: ["systemSettings", keys],
    queryFn: async () => {
      const client = new SystemSettingsClient();
      const query = new GetSystemSettingsQuery({ keys });
      return await client.getSystemSettings(query);
    },
  });
};

export default useGetSystemSettings;
