import { useQuery } from "@tanstack/react-query";
import { AdminFinanceClient } from "../../web-api-client.ts";

const normalizeDateInput = (value) => {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const useGetTopCoursesByRevenue = (from = null, to = null, topN = 10) => {
  return useQuery({
    queryKey: ["finance-top-courses", from, to, topN],
    queryFn: async () => {
      const client = new AdminFinanceClient();
      return await client.getTopCourses(
        normalizeDateInput(from),
        normalizeDateInput(to),
        topN
      );
    },
    staleTime: 60 * 1000,
    keepPreviousData: true,
  });
};

export default useGetTopCoursesByRevenue;
