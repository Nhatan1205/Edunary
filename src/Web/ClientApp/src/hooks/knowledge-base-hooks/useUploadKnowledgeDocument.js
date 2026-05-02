import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import queryClient from "../../configs/reactQuery.js";
import { tokenService } from "../../utils/tokenService.js";

const useUploadKnowledgeDocument = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const token = tokenService.getToken();

      const response = await fetch("/api/KnowledgeBase", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.title || "Upload failed");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Document uploaded! Embedding will begin shortly.");
      queryClient.invalidateQueries({ queryKey: ["knowledgeDocuments"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to upload document. Please try again.");
    },
  });
};

export default useUploadKnowledgeDocument;
