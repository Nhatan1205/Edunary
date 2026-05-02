import { useQuery } from "@tanstack/react-query";
import { UserEmbeddingsClient } from "../../web-api-client.ts";

/**
 * Fetches paginated user embedding sync status from the backend.
 * @param {string} searchText - Search by name, email, or user ID
 * @param {string} statusFilter - "All" | "Embedded" | "Missing"
 * @param {number} pageNumber - 1-based page number
 * @param {number} pageSize - Items per page
 */
const useGetUserEmbeddingSyncStatus = (
  searchText = "",
  statusFilter = "All",
  pageNumber = 1,
  pageSize = 10
) => {
  return useQuery({
    queryKey: ["user-embedding-sync-status", searchText, statusFilter, pageNumber, pageSize],
    queryFn: async () => {
      const client = new UserEmbeddingsClient();
      return await client.getUserEmbeddingSyncStatus(searchText || undefined, statusFilter, pageNumber, pageSize);
    },
    staleTime: 30_000,
    keepPreviousData: true,
  });
};

export default useGetUserEmbeddingSyncStatus;
