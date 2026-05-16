import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { tokenService } from "../../utils/tokenService";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useUpsertVideoCaption = () => {
  return useMutation({
    mutationFn: async ({ mediaFileId, language, file }) => {
      const formData = new FormData();
      formData.append("mediaFileId", String(mediaFileId));
      formData.append("language", String(language));
      formData.append("file", file);

      const token = tokenService.getToken();
      const response = await fetch("/api/VideoCaptions/upsert", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload caption.");
      }

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hlsVideoByCourse"] });
      queryClient.invalidateQueries({ queryKey: ["captionLanguages"] });
      toast.success("Caption uploaded successfully.");
    },
    onError: (error) => {
      let msg = extractApiError(error);
      if (!msg && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          msg = parsed.message || (parsed.errors && Object.values(parsed.errors).flat().join(", "));
        } catch {
          msg = error.message;
        }
      }
      toast.error(msg || "Failed to upload caption.");
    },
  });
};

export default useUpsertVideoCaption;
