import { useQuery } from "@tanstack/react-query";
import { MediaFileClient } from "../../web-api-client.ts";

const useGetHlsVideoByCourseId = (courseId, language) => {
  return useQuery({
    queryKey: ["hlsVideoByCourse", courseId, language],
    queryFn: async () => {
      const client = new MediaFileClient();
      return await client.getHlsVideoByCourseId(courseId, language);
    },
    enabled:
      Number.isFinite(Number(courseId)) &&
      Number.isFinite(Number(language)),
  });
};

export default useGetHlsVideoByCourseId;
