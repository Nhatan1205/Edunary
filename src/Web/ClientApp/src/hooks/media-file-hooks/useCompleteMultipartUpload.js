import { useMutation } from "@tanstack/react-query";
import { MediaFileClient, CompleteMultipartUploadCommand } from "../../web-api-client.ts";

const useCompleteMultipartUpload = () => {
    return useMutation({
        mutationFn: async ({ fileName, uploadId }) => {
            const client = new MediaFileClient();
            const command = new CompleteMultipartUploadCommand({
                fileName: fileName,
                uploadId: uploadId
            });
            return await client.completeMultipartUpload(command);
        }
    });
}
export default useCompleteMultipartUpload;