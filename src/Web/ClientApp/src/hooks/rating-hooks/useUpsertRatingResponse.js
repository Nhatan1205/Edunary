import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { RatingCourseClient, UpsertRatingResponseCommand } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useUpsertRatingResponse = () => {
  return useMutation({
    mutationFn: async ({ ratingCourseId, responseText }) => {
      const client = new RatingCourseClient();
      const command = new UpsertRatingResponseCommand({ ratingCourseId, responseText });
      return await client.upsertRatingResponse(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorReviews"] });
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useUpsertRatingResponse;
