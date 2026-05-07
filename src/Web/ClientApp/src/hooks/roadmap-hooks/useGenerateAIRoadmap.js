import { useMutation } from "@tanstack/react-query";
import { RoadmapsClient, GenerateAIRoadmapCommand } from "../../web-api-client.ts";

/**
 * useGenerateAIRoadmap
 *
 * Calls POST /api/Roadmaps/generate-ai.
 * Server streams progress via SignalR (Roadmap.Progress:{userId}).
 * onSuccess receives { result: { id, title, nodeCount }, message }.
 */
const useGenerateAIRoadmap = ({ onSuccess, onError } = {}) => {
  const client = new RoadmapsClient();

  return useMutation({
    mutationFn: async ({ description, roadmapTopicId }) => {
      const command = new GenerateAIRoadmapCommand({
        description,
        roadmapTopicId,
      });
      return await client.generateAIRoadmap(command);
    },
    onSuccess: (response) => {
      onSuccess?.(response);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
};

export default useGenerateAIRoadmap;
