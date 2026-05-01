import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { TopicsClient, UpdateTopicCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useUpdateTopic = () => {
    const client = new TopicsClient();

    return useMutation({
        mutationFn: async (data) => {
            const command = new UpdateTopicCommand({ id: data.id, name: data.name });
            const result = await client.updateTopic(command);
            if (!result.succeeded) throw new Error(result.message);
            return result;
        },
        onSuccess: (result) => {
            if (result?.succeeded) {
                toast.success("Topic updated successfully!");
                queryClient.invalidateQueries(["topics"]);
            } else {
                toast.error(result?.message || "Failed to update topic.");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update topic.");
        },
    });
};

export default useUpdateTopic;
