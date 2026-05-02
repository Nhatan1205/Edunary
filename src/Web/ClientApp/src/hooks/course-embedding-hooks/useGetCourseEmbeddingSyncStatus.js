import { useQuery } from "@tanstack/react-query";
import { CourseEmbeddingsClient } from "../../web-api-client.ts";

/**
 * Fetches paginated course embedding sync status from the backend.
 * @param {string} searchText - Search by ID or title
 * @param {string} statusFilter - "All" | "Embedded" | "Missing"
 * @param {number} pageNumber - 1-based page number
 * @param {number} pageSize - Items per page
 */
const useGetCourseEmbeddingSyncStatus = (
  searchText = "",
  statusFilter = "All",
  pageNumber = 1,
  pageSize = 10
) => {
  return useQuery({
    queryKey: ["course-embedding-sync-status", searchText, statusFilter, pageNumber, pageSize],
    queryFn: async () => {
      const client = new CourseEmbeddingsClient();
      return await client.getSyncStatus(searchText || undefined, statusFilter, pageNumber, pageSize);
    },
    staleTime: 30_000,
    keepPreviousData: true, // smooth pagination transitions
  });
};

export default useGetCourseEmbeddingSyncStatus;
