import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { VideoCaptionsClient } from "../../web-api-client.ts";

const useDeleteVideoCaption = () => {
  return useMutation({
    mutationFn: async (captionId) => {
      const client = new VideoCaptionsClient();
      return await client.deleteCaption(captionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hlsVideoByCourse"] });
      queryClient.invalidateQueries({ queryKey: ["captionLanguages"] });
    },
  });
};

export default useDeleteVideoCaption;
