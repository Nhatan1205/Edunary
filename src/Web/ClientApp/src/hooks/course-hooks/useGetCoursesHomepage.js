import { useQuery } from "@tanstack/react-query";
import { CoursesClient } from "../../web-api-client.ts";

const useGetHomepageCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const coursesClient = new CoursesClient();
      const result = await coursesClient.getHomepageCourses();

      if (!result) {
        throw new Error("Failed to fetch homepage courses");
      }

      const parseCoursesArray = (courses) => {
        if (!courses || !Array.isArray(courses)) return courses;

        return courses.map((course) => {
          let learningObjectives = JSON.parse(course.learningObjectives || "[]");
          let requirements = JSON.parse(course.requirements || "[]");
          let targetAudience = JSON.parse(course.targetAudience || "[]");

          return {
            ...course,
            learningObjectives,
            requirements,
            targetAudience,
          };
        });
      };

      return {
        ...result,
        popularCourses: parseCoursesArray(result.popularCourses),
        newCourses: parseCoursesArray(result.newCourses),
        topRatedCourses: parseCoursesArray(result.topRatedCourses),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetHomepageCourses;