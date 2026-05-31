import { useQuery } from "@tanstack/react-query";
import { InstructorReportsClient } from "../../web-api-client.ts";

const normalizeDateInput = (value) => {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const useGetInstructorReport = (from = null, to = null, courseId = null) => {
  return useQuery({
    queryKey: ["instructor-report", from, to, courseId],
    queryFn: async () => {
      const client = new InstructorReportsClient();
      return await client.getInstructorReport(
        normalizeDateInput(from),
        normalizeDateInput(to),
        courseId == null || courseId === "" ? null : courseId,
      );
    },
    keepPreviousData: true,
  });
};

export default useGetInstructorReport;
