import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, UpdateCoursePricingCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";
import { extractApiError } from "../../utils/helpers.js";

const useUpdateCoursePricing = () => {
  const coursesClient = new CoursesClient();

  return useMutation({
    mutationFn: async (pricingData) => {
      const command = new UpdateCoursePricingCommand({
        ...pricingData,
      });

      return await coursesClient.updateCoursePricing(command);
    },
    onSuccess: (_, variables) => {
      toast.success("Course pricing updated successfully!");
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", variables.courseId]);
    },
    onError: (error) => {
      const msg = extractApiError(error);
      toast.error(msg);
    },
  });
};

export default useUpdateCoursePricing;
