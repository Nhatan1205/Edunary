import { useQuery } from "@tanstack/react-query";
import { MediaFileClient } from "../../web-api-client.ts";

const useGetMediaFile = () => {
  return useQuery({
    queryKey: ["mediaFiles"],
    queryFn: async () => {
      const client = new MediaFileClient();
      return await client.getMediaFilesByUserId();
    },
  });
};

export default useGetMediaFile;
