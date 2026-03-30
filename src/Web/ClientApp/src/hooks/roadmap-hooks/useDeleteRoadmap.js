import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RoadmapsClient, DeleteRoadmapCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useDeleteRoadmap = (onSuccessCallback) => {
  const client = new RoadmapsClient();

  return useMutation({
    mutationFn: async (roadmapId) => {
      const command = new DeleteRoadmapCommand({ id: roadmapId });
      return await client.deleteRoadmap(command);
    },
    onSuccess: () => {
      toast.success("Roadmap deleted.");
      queryClient.invalidateQueries(["roadmaps"]);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      let msg = "Failed to delete roadmap. Please try again.";
      try {
        const parsed = JSON.parse(error?.response);
        if (parsed?.message) msg = parsed.message;
      } catch {
        if (error?.message) msg = error.message;
      }
      toast.error(msg);
    },
  });
};

export default useDeleteRoadmap;
