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

      let learningObjectives = JSON.parse(result.learningObjectives || "[]");
      let requirements = JSON.parse(result.requirements || "[]");
      let targetAudience = JSON.parse(result.targetAudience || "[]");
      
      return {
        ...result,
        learningObjectives,
        requirements,
        targetAudience,
      };
    },
    enabled: !!id, // Chỉ fetch khi id có giá trị hợp lệ
  });
};

export default useGetCourseById;
