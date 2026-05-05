import { useQuery } from "@tanstack/react-query";
import { QdrantDashboardClient } from "../../web-api-client.ts";

const useGetQdrantCollections = () => {
  return useQuery({
    queryKey: ["qdrant-collections"],
    queryFn: async () => {
      const client = new QdrantDashboardClient();
      return await client.getCollections();
    },
    staleTime: 10_000,
    keepPreviousData: true,
  });
};

export default useGetQdrantCollections;
