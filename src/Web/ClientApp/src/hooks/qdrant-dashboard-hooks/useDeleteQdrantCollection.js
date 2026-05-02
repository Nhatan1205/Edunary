import { useMutation } from "@tanstack/react-query";
import { QdrantDashboardClient } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";

const useDeleteQdrantCollection = () => {
  return useMutation({
    mutationFn: async (collectionName) => {
      const client = new QdrantDashboardClient();
      return await client.deleteCollection(collectionName);
    },
    onSuccess: () => {
      toast.success("Collection deleted successfully.");
      queryClient.invalidateQueries(["qdrant-collections"]);
    },
    onError: (error) => {
      toast.error(error?.response || error?.message || "Failed to delete collection.");
    },
  });
};

export default useDeleteQdrantCollection;
