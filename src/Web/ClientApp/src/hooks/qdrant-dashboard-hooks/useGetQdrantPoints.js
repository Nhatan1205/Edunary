import { useQuery } from "@tanstack/react-query";
import { QdrantDashboardClient } from "../../web-api-client.ts";

const useGetQdrantPoints = (collectionName, params) => {
  const { limit = 20, offset = null, filterKey = null, filterValue = null } = params || {};

  return useQuery({
    queryKey: ["qdrant-points", collectionName, limit, offset, filterKey, filterValue],
    queryFn: async () => {
      const client = new QdrantDashboardClient();
      return await client.getPoints(collectionName, limit, offset, filterKey, filterValue);
    },
    enabled: !!collectionName,
    keepPreviousData: true,
  });
};

export default useGetQdrantPoints;
