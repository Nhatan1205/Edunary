import { useQuery } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";

const useGetCollaborators = (courseId) => {
  return useQuery({
    queryKey: ["collaborators", courseId],
    queryFn: async () => {
      const client = new CourseCollaboratorsClient();
      return await client.getCollaborators(courseId);
    },
    enabled: !!courseId,
  });
};

export default useGetCollaborators;
