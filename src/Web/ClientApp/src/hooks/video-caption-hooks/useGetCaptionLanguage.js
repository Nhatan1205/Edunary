import { useQuery } from "@tanstack/react-query";
import { VideoCaptionsClient } from "../../web-api-client.ts";

const useGetCaptionLanguage = (courseId) => {
  return useQuery({
    queryKey: ["captionLanguages", courseId],
    queryFn: async () => {
      const client = new VideoCaptionsClient();
      return await client.getCaptionLanguage(courseId);
    },
    enabled: Number.isFinite(Number(courseId)),
  });
};

export default useGetCaptionLanguage;
