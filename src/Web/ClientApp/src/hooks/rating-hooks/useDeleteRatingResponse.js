import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { RatingCourseClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";
import { extractApiError } from "../../utils/helpers.js";

const useDeleteRatingResponse = () => {
  return useMutation({
    mutationFn: async (ratingCourseId) => {
      const client = new RatingCourseClient();
      return await client.deleteRatingResponse(ratingCourseId);
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

export default useDeleteRatingResponse;
