import { useMutation } from "@tanstack/react-query";
import queryClient from "../../configs/reactQuery.js";
import { toast } from "react-toastify";
import { CourseContentClient, AddLinkToCCCommand } from "../../web-api-client.ts";

const useAddLinkToCC = () => {
    return useMutation({
        mutationFn: async ({ title, url, isOverride = false, courseId = null, contentType = "external-link" }) => {
            const client = new CourseContentClient();
            const command = new AddLinkToCCCommand({
                title: title,
                url: url,
                contentType: contentType,
                isOverride: isOverride,
                courseId: courseId
            });
            return await client.addLinkToCourseContent(command);
        },
        onSuccess: () => {
            toast.success("Link added to course content successfully!");
            queryClient.invalidateQueries({ queryKey: ["courseContents"] });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add link to course content");
        }
    });
};
export default useAddLinkToCC;