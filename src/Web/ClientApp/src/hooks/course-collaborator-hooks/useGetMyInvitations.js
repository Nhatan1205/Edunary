import { useQuery } from "@tanstack/react-query";
import { CourseCollaboratorsClient } from "../../web-api-client.ts";

const useGetMyInvitations = () => {
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const client = new CourseCollaboratorsClient();
      return await client.getMyInvitations();
    },
  });
};

export default useGetMyInvitations;
