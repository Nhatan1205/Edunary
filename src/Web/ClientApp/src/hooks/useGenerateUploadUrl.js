import { useMutation } from "@tanstack/react-query";
import { CourseContentClient, GenerateUploadUrlCommand } from "../web-api-client.ts";

const useGenerateUploadUrl = () => {
    return useMutation({
        mutationFn: async ({ fileName, contentType }) => {
            console.log("Generating upload URL for:", fileName, contentType);
            const client = new CourseContentClient();
            const command = new GenerateUploadUrlCommand({
                fileName: fileName,
                contentType: contentType
            });
            return await client.generateUploadUrl(command);
        }
    });
}
export default useGenerateUploadUrl;