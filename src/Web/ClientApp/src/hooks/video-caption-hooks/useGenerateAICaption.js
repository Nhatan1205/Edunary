import { useMutation } from "@tanstack/react-query";
import { VideoCaptionsClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useGenerateAICaption = () => {
  return useMutation({
    mutationFn: async ({ mediaFileId, targetLanguage }) => {
      const client = new VideoCaptionsClient();
      return await client.generateAICaption({ mediaFileId, targetLanguage: targetLanguage ?? null });
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg || "Failed to start AI caption generation.");
    },
  });
};

export default useGenerateAICaption;
