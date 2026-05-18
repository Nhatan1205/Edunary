import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { VideoCaptionsClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

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
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useDeleteVideoCaption;
