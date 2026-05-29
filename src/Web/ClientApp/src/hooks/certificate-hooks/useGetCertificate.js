import { useQuery } from "@tanstack/react-query";
import { CertificatesClient } from "../../web-api-client.ts";

const useGetCertificate = (courseId) => {
    return useQuery({
        queryKey: ["certificate", courseId],
        queryFn: async () => {
            const client = new CertificatesClient();
            return await client.getCertificate(courseId);
        },
        enabled: !!courseId,
    });
};

export default useGetCertificate;
