import { useQuery } from "@tanstack/react-query";
import { UserClient } from "../../web-api-client.ts";

const useGetTopInstructors = (count = 3) => {
  return useQuery({
    queryKey: ["top-instructors", count],
    queryFn: async () => {
      const client = new UserClient();
      return await client.getTopInstructors(count);
    },
  });
};

export default useGetTopInstructors;
