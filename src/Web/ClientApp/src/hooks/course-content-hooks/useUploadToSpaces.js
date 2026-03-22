import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useUploadToSpaces = () => {
  return useMutation({
    mutationFn: async ({ uploadUrl, file }) => {
      if (uploadUrl && file) {
        try {
          const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
              "x-amz-acl": "public-read"
            },
            body: file,
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { ok: false, message: `Upload failed: ${errorText}` };
          }
          return { ok: true };

        } catch (networkError) {
          return { ok: false, message: networkError.message };
        }
      } else {
        return { ok: false, message: "Upload URL and file are required." };
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        toast.success("Course content uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload file to storage.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred.");
    }
  });
};

export default useUploadToSpaces;