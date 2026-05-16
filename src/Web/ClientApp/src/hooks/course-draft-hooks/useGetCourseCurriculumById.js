import { useQuery } from "@tanstack/react-query";
import { CourseDraftsClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetCourseCurriculumById = (id) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["courseCurriculum", id],
    queryFn: async () => {
      try {
        const coursesClient = new CourseDraftsClient();
        const result = await coursesClient.getCourseCurriculumById(id);

        if (!result || !result.id) {
          navigate("/instructor/courses");
          return null;
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
      } catch (err) {
        navigate("/instructor/courses");
        return null;
      }
    },
    enabled: !!id,
  });
}

export default useGetCourseCurriculumById;