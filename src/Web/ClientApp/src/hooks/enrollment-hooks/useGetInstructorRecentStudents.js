import { useQuery } from "@tanstack/react-query";
import { EnrollmentClient } from "../../web-api-client.ts";

const useGetInstructorRecentStudents = () => {
  return useQuery({
    queryKey: ["instructorRecentStudents"],
    queryFn: async () => {
      const client = new EnrollmentClient();
      return await client.getInstructorRecentStudents();
    },
  });
};

export default useGetInstructorRecentStudents;
