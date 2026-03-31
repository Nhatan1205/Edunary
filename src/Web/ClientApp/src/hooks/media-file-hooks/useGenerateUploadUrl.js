import { useMutation } from "@tanstack/react-query";
import { MediaFileClient, GenerateUploadUrlCommand } from "../../web-api-client.ts";

const useGenerateUploadUrl = () => {
    return useMutation({
        mutationFn: async ({ fileName, contentType }) => {
            const client = new MediaFileClient();
            const command = new GenerateUploadUrlCommand({
                fileName: fileName,
                contentType: contentType
            });
            return await client.generateUploadUrl(command);
        }
    });
}
export default useGenerateUploadUrl;