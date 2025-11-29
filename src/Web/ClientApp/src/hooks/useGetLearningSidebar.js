import { useQuery } from "@tanstack/react-query";
import { CourseProgressClient } from "../web-api-client.ts";
import { useNavigate } from "react-router";

const useGetLearningSidebar = (courseId) => {
  const navigate = useNavigate();
  return useQuery({
    queryKey: ["learningSidebar", courseId],
    queryFn: async () => {
      const client = new CourseProgressClient();
      var result = await client.getLearningSidebarByCourseId(courseId);
      if (!result || !result.courseId) {
        navigate("/my-learning");
      }
      return result;
    },
  });
}

export default useGetLearningSidebar;