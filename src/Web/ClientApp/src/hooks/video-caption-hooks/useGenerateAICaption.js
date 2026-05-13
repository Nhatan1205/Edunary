import { useMutation } from "@tanstack/react-query";
import { VideoCaptionsClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";

const useGenerateAICaption = () => {
  return useMutation({
    mutationFn: async ({ mediaFileId, targetLanguage }) => {
      const client = new VideoCaptionsClient();
      return await client.generateAICaption({ mediaFileId, targetLanguage: targetLanguage ?? null });
    },
    onError: (error) => {
      toast.error(
        error?.response || error?.message || "Failed to start AI caption generation."
      );
    },
  });
};

export default useGenerateAICaption;
