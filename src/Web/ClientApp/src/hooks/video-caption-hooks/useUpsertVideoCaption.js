import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { tokenService } from "../../utils/tokenService";

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

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hlsVideoByCourse"] });
      queryClient.invalidateQueries({ queryKey: ["captionLanguages"] });
    },
  });
};

export default useUpsertVideoCaption;
