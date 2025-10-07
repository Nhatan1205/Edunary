import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../web-api-client.ts";

const useGetCourseById = (id) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getCourseById(id);

      if (!result) {
        throw new Error("Failed to fetch course information");
      }

      return result;
    },
    enabled: !!id, // Chỉ fetch khi id có giá trị hợp lệ
  });
};

export default useGetCourseById;
