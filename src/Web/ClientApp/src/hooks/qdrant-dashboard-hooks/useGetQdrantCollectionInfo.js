import { useQuery } from "@tanstack/react-query";
import { QdrantDashboardClient } from "../../web-api-client.ts";

const useGetQdrantCollectionInfo = (name) => {
  return useQuery({
    queryKey: ["qdrant-collection", name],
    queryFn: async () => {
      const client = new QdrantDashboardClient();
      return await client.getCollectionInfo(name);
    },
    enabled: !!name,
  });
};

export default useGetQdrantCollectionInfo;
