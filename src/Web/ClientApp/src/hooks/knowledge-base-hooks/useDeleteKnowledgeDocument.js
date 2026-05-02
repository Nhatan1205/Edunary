import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { KnowledgeBaseClient } from "../../web-api-client.ts";

const useDeleteKnowledgeDocument = () => {
  return useMutation({
    mutationFn: async (id) => {
      const client = new KnowledgeBaseClient();
      return await client.deleteDocument(id);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete document. Please try again.");
    },
  });
};

export default useDeleteKnowledgeDocument;
