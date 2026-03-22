import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../../web-api-client.ts";

const useGetPublicCourseById = (id) => {
  return useQuery({
    queryKey: ["publicCourse", id],
    queryFn: async () => {
      const coursesClient = new CoursesClient();

      try {
        const result = await coursesClient.getPublicCourseById(id);

        if (result === null) {
          throw new Error("Course not found");
        }

        let learningObjectives = JSON.parse(result.learningObjectives || "[]");
        let requirements = JSON.parse(result.requirements || "[]");
        let targetAudience = JSON.parse(result.targetAudience || "[]");
        let content = JSON.parse(result.content);

        return {
          ...result,
          content,
          learningObjectives,
          requirements,
          targetAudience,
        };
      } catch (error) {
        if (error.status === 404) {
          throw new Error("Course not found");
        }
        throw new Error("Failed to fetch course information");
      }
    },
    enabled: !!id, // Only fetch when id has a valid value
    retry: false, // Do not retry when course is not found
  });
};

export default useGetPublicCourseById;