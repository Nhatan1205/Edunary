import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { MediaFileClient } from "../../web-api-client.ts";

const useDeleteMediaFileById = () => {
  return useMutation({
    mutationFn: async (id) => {
      const client = new MediaFileClient();
      return await toast.promise(
        client.deleteMediaFileById(id),
        {
          pending: "Deleting course content...",
          success: "Course content deleted successfully!",
          error: "Failed to delete course content",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    },
  });
};

export default useDeleteMediaFileById;
