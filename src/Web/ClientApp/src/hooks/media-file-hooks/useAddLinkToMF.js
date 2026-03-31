import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { MediaFileClient, AddLinkToMFCommand } from "../../web-api-client.ts";

const useAddLinkToMF = () => {
    return useMutation({
        mutationFn: async ({ title, url, isOverride = false, courseId = null, contentType = "external-link" }) => {
            const client = new MediaFileClient();
            const command = new AddLinkToMFCommand({
                title: title,
                url: url,
                contentType: contentType,
                isOverride: isOverride,
                courseId: courseId
            });
            return await client.addLinkToMediaFile(command);
        },
        onSuccess: () => {
            toast.success("Link added to course content successfully!");
            queryClient.invalidateQueries({ queryKey: ["mediaFiles"] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add link to course content");
        }
    });
};
export default useAddLinkToMF;