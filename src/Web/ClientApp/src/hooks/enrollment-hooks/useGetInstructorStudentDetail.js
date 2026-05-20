import { useQuery } from "@tanstack/react-query";
import { EnrollmentClient } from "../../web-api-client.ts";

const useGetInstructorStudentDetail = (studentId) => {
  return useQuery({
    queryKey: ["instructorStudentDetail", studentId],
    queryFn: async () => {
      const client = new EnrollmentClient();
      return await client.getInstructorStudentDetail(studentId);
    },
    enabled: !!studentId,
  });
};

export default useGetInstructorStudentDetail;
