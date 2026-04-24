import { useMutation } from "@tanstack/react-query";
import { MediaFileClient, StartMultipartUploadCommand } from "../../web-api-client.ts";

const useStartMultipartUpload = () => {
    return useMutation({
        mutationFn: async ({ fileName, contentType, partsCount }) => {
            const client = new MediaFileClient();
            const command = new StartMultipartUploadCommand({
                fileName: fileName,
                contentType: contentType,
                partsCount: partsCount
            });
            return await client.startMultipartUpload(command);
        }
    });
}
export default useStartMultipartUpload;