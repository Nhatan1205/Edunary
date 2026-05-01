import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LearnerProfilesClient } from "../../web-api-client.ts";
import { toast } from "react-toastify";

const useUpsertLearnerProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (command) => {
            const client = new LearnerProfilesClient();
            return await client.upsertProfile(command);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["learner-profile", "me"] });
        },
        onError: (err) => {
            toast.error(err?.message ?? "Failed to save profile. Please try again.");
        },
    });
};

export default useUpsertLearnerProfile;
