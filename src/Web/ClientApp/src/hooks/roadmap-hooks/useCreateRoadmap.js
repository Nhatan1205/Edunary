import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RoadmapsClient, CreateRoadmapCommand } from "../../web-api-client.ts";
import { useNavigate } from "react-router";
import queryClient from "../../configs/reactQuery.js";

const useCreateRoadmap = () => {
  const roadmapsClient = new RoadmapsClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (roadmapData) => {
      const command = new CreateRoadmapCommand({
        ...roadmapData,
      });

      return await roadmapsClient.createRoadmap(command);
    },
    onSuccess: (response) => {
      const roadmapId = response?.result?.id;
      if (roadmapId) {
        toast.success("Roadmap created successfully!");
        queryClient.invalidateQueries(["roadmaps"]);
        navigate(`/instructor/roadmaps/${roadmapId}/edit`, { replace: true });
      } else {
        navigate(`/instructor/roadmaps`, { replace: true });
      }
    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to create roadmap. Please try again.";
      toast.error(msg);
    },
  });
};

export default useCreateRoadmap;
