import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RoadmapsClient, UpdateRoadmapCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateRoadmap = () => {
  const roadmapsClient = new RoadmapsClient();

  return useMutation({
    mutationFn: async (data) => {
      const command = new UpdateRoadmapCommand({ ...data });
      return await roadmapsClient.updateRoadmap(command);
    },
    onSuccess: (_, variables) => {
      toast.success("Saved");
      queryClient.invalidateQueries(["roadmaps"]);
      queryClient.invalidateQueries(["roadmapDetail", variables.id]);
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to update roadmap. Please try again.";
      toast.error(msg);
    },
  });
};

export default useUpdateRoadmap;
