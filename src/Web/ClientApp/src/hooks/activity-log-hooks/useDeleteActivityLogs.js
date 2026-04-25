import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ActivityLogsClient, DeleteActivityLogsCommand } from "../../web-api-client.ts";
import queryClient from "../../configs/reactQuery.js";

const useDeleteActivityLogs = () => {
    const client = new ActivityLogsClient();

    return useMutation({
        mutationFn: async (ids) => {
            const command = new DeleteActivityLogsCommand({ ids });
            return await client.deleteActivityLogs(command);
        },
        onSuccess: () => {
            toast.success("Activity log(s) deleted successfully.");
            queryClient.invalidateQueries(["activity-logs"]);
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to delete activity log(s).");
        },
    });
};

export default useDeleteActivityLogs;
