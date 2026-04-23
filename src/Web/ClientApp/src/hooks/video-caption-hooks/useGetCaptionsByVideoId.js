import { useQuery } from "@tanstack/react-query";
import { VideoCaptionsClient } from "../../web-api-client.ts";

const useGetCaptionsByVideoId = (videoId) => {
  return useQuery({
    queryKey: ["videoCaptions", videoId],
    queryFn: async () => {
      const client = new VideoCaptionsClient();
      return await client.getVideoCaptions(videoId);
    },
    enabled: !!videoId,
  });
};

export default useGetCaptionsByVideoId;
