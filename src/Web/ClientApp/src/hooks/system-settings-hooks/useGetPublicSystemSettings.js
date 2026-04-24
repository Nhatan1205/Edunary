import { useQuery } from "@tanstack/react-query";
import { SystemSettingsClient, GetPublicSystemSettingsQuery } from "../../web-api-client.ts";

const useGetPublicSystemSettings = (keys = []) => {
  return useQuery({
    queryKey: ["publicSystemSettings", keys],
    queryFn: async () => {
      const client = new SystemSettingsClient();
      const query = new GetPublicSystemSettingsQuery({ keys });
      return await client.getPublicSystemSettings(query);
    },
  });
};

export default useGetPublicSystemSettings;
