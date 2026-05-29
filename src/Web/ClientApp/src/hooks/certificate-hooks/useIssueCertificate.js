import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CertificatesClient, IssueCertificateCommand } from "../../web-api-client.ts";

const useIssueCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (courseId) => {
            const client = new CertificatesClient();
            return await client.issueCertificate(
                new IssueCertificateCommand({ courseId })
            );
        },
        onSuccess: (res, courseId) => {
            if (res && res.result) {
                queryClient.invalidateQueries({ queryKey: ["certificate", courseId] });
                queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
            }
        },
    });
};

export default useIssueCertificate;
