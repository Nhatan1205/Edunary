import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useUploadToSpaces = () => {
  return useMutation({
    mutationFn: async ({ file, presignedUrls, onProgress }) => {
      if (!file || !presignedUrls || presignedUrls.length === 0) {
        return { ok: false, message: "Missing required parameters." };
      }
      try {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        let uploadedBytes = 0;
        const CONCURRENCY_LIMIT = 4; // Run 4 chunks concurrently

        let currentIndex = 0;
        const uploadWorker = async () => {
          while (currentIndex < presignedUrls.length) {
            const i = currentIndex++;
            const url = presignedUrls[i];
            const start = i * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);
            const response = await fetch(url, {
              method: "PUT",
              body: chunk
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to upload chunk ${i + 1}: ${errorText}`);
            }

            uploadedBytes += chunk.size;
            if (onProgress) {
              onProgress(Math.round((uploadedBytes / file.size) * 100));
            }
          }
        };

        const workers = Array(CONCURRENCY_LIMIT).fill(null).map(() => uploadWorker());
        await Promise.all(workers);

        return { ok: true };

      } catch (error) {
        return { ok: false, message: error.message };
      }
    },
    onSuccess: (data) => {
      if (!data.ok) {
        toast.error(data.message || "Failed to upload file chunks to storage.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred during upload.");
    }
  });
};

export default useUploadToSpaces;