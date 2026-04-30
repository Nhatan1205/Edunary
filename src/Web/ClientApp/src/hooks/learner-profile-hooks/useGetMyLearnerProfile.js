import { useQuery } from "@tanstack/react-query";
import { LearnerProfilesClient } from "../../web-api-client.ts";

const useGetMyLearnerProfile = () => {
  return useQuery({
    queryKey: ["learner-profile", "me"],
    queryFn: async () => {
      const client = new LearnerProfilesClient();
      const result = await client.getMyProfile();
      return result ?? null;
    },
    staleTime: 30 * 1000,
  });
};

export default useGetMyLearnerProfile;
