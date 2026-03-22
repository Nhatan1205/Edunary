import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetLearningHeader = (courseId) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["learningHeader", courseId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      var result = await client.getLearningHeaderByCourseId(courseId);
      if (!result) {
        navigate("/my-learning");
      }
      return result;
    },
  });
}
export default useGetLearningHeader;