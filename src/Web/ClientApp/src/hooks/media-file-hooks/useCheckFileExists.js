import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MediaFileClient } from "../../web-api-client.ts";

const useCheckFileExists = () => {
  return useMutation({
    mutationFn: async ({ fileName }) => {
      const client = new MediaFileClient();
      return await client.checkFileExists(fileName);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check file existence");
    },
  });
};

export default useCheckFileExists;
