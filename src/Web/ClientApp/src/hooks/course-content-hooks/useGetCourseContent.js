import { useQuery } from "@tanstack/react-query";
import { CourseContentClient } from "../../web-api-client.ts";

const useGetCourseContent = () => {
  return useQuery({
    queryKey: ["courseContents"],
    queryFn: async () => {
      const client = new CourseContentClient();
      return await client.getCourseContentsByUserId();
    },
  });
};

export default useGetCourseContent;
