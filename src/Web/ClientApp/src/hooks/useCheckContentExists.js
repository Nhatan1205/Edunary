import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CourseContentClient } from "../web-api-client.ts";

const useCheckContentExists = () => {
  return useMutation({
    mutationFn: async ({ fileName }) => {
      const client = new CourseContentClient();
      return await client.checkContentExists(fileName);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check file existence");
    },
  });
};

export default useCheckContentExists;
