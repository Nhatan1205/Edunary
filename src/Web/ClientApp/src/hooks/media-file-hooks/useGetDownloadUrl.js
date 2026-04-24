import { useMutation } from "@tanstack/react-query";
import { MediaFileClient } from "../../web-api-client.ts";

const useGetDownloadUrl = () => {
    return useMutation({
        mutationFn: async (mediaFileId) => {
            const mediaFileClient = new MediaFileClient();
            return await mediaFileClient.getDownloadUrl(mediaFileId);
        },
    });
};

export default useGetDownloadUrl;
