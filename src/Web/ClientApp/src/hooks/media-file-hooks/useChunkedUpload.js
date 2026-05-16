import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { tokenService } from "../../utils/tokenService.js";
import { extractApiError } from "../../utils/helpers.js";

const MAX_RETRIES = 3;

const useChunkedUpload = () => {
  return useMutation({
    mutationFn: async ({ file, fileHash = "", courseId = null, onProgress = null }) => {
      try {
        const token = tokenService.getToken();
        const CHUNK_SIZE = file.size < 5 * 1024 * 1024 ? file.size : 5 * 1024 * 1024;

        const actualFileHash = await calculateFileHash(file);
        // Step 1: Initiate Upload Session
        const initiateResponse = await fetch("/api/MediaFile/chunks/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            chunkSize: CHUNK_SIZE,
            totalChunks: Math.ceil(file.size / CHUNK_SIZE),
            fileHash: actualFileHash,
            contentType: file.type,
            courseId: courseId,
          }),
        });

        if (!initiateResponse.ok) {
          const errorText = await initiateResponse.text();
          throw new Error(errorText || "Failed to initiate upload");
        }

        const sessionData = await initiateResponse.json();
        const uploadSession = sessionData;

        if (!uploadSession?.sessionId) {
          throw new Error("Failed to get session ID from server");
        }

        // Call onProgress for initiation
        if (onProgress) {
          onProgress({
            uploadedChunks: 0,
            totalChunks: uploadSession.totalChunks,
            progressPercentage: 0,
            status: "IN_PROGRESS",
          });
        }

        // Step 2: Upload Chunks Sequentially
        const totalChunks = uploadSession.totalChunks;
        let uploadedChunks = uploadSession.uploadedChunks || 0;

        for (let chunkNumber = uploadedChunks; chunkNumber < totalChunks; chunkNumber++) {
          const start = chunkNumber * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunkBlob = file.slice(start, end);

          // Calculate chunk hash if needed (simplified - use file hash for now)
          const chunkHash = fileHash;

          // Create FormData for chunk upload
          const formData = new FormData();
          formData.append("chunkFile", chunkBlob, `${file.name}.chunk${chunkNumber}`);
          formData.append("sessionId", uploadSession.sessionId);
          formData.append("chunkNumber", chunkNumber.toString());
          formData.append("chunkHash", chunkHash);

          // Upload chunk with retry logic
          let chunkUploaded = false;
          let lastError = null;

          for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
              const chunkResponse = await fetch("/api/MediaFile/chunks/upload", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              if (!chunkResponse.ok) {
                const errorText = await chunkResponse.text();
                throw new Error(errorText || `Failed to upload chunk ${chunkNumber}`);
              }

              const chunkResult = await chunkResponse.json();
              uploadedChunks = chunkResult.uploadedChunks || uploadedChunks + 1;

              // Call onProgress after each chunk
              if (onProgress) {
                const progressPercentage = (uploadedChunks / totalChunks) * 100;
                onProgress({
                  uploadedChunks: uploadedChunks,
                  totalChunks: totalChunks,
                  progressPercentage: progressPercentage,
                  status: uploadedChunks === totalChunks ? "COMPLETED" : "IN_PROGRESS",
                });
              }

              chunkUploaded = true;
              break;
            } catch (error) {
              lastError = error;
              if (attempt < MAX_RETRIES - 1) {
                // Wait before retry with exponential backoff
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
              }
            }
          }

          if (!chunkUploaded) {
            throw new Error(
              `Failed to upload chunk ${chunkNumber} after ${MAX_RETRIES} attempts: ${lastError.message}`
            );
          }
        }

        // Step 3: Get Final Upload Status
        const statusResponse = await fetch(
          `/api/MediaFile/chunks/${uploadSession.sessionId}/status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(errorText || "Failed to get upload status");
        }

        const finalStatus = await statusResponse.json();
        const finalSessionData = finalStatus;

        return {
          sessionId: finalSessionData.sessionId,
          fileName: finalSessionData.fileName,
          fileSize: finalSessionData.fileSize,
          chunkSize: finalSessionData.chunkSize,
          totalChunks: finalSessionData.totalChunks,
          uploadedChunks: finalSessionData.uploadedChunks,
          status: finalSessionData.status,
          progressPercentage:
            (finalSessionData.uploadedChunks / finalSessionData.totalChunks) * 100,
          courseId: finalSessionData.courseId,
          fileUrl: finalSessionData.fileUrl,
          contentType: finalSessionData.contentType,
          duration: finalSessionData.duration
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`File uploaded successfully! (${data.fileName})`);
      queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
    },
    onError: (error) => {
      let msg = extractApiError(error);
      if (!msg && error?.message) {
        try {
          // fetch errors have the JSON response in error.message
          const parsed = JSON.parse(error.message);
          msg = parsed.message || (parsed.errors && Object.values(parsed.errors).flat().join(", "));
        } catch {
          msg = error.message;
        }
      }
      toast.error(msg || "Failed to upload file.");
    },
  });
};

const calculateFileHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map(byte => String.fromCharCode(byte)).join('');
  return btoa(hashString);
};

export default useChunkedUpload;
