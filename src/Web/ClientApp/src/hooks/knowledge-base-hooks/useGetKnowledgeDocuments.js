import { useQuery } from "@tanstack/react-query";
import { KnowledgeBaseClient } from "../../web-api-client.ts";

const useGetKnowledgeDocuments = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["knowledgeDocuments", pageNumber, pageSize],
    queryFn: async () => {
      const client = new KnowledgeBaseClient();
      return await client.getDocuments(pageNumber, pageSize);
    },
    keepPreviousData: true,
  });
};

export default useGetKnowledgeDocuments;
