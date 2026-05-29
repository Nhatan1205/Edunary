import { useQuery } from "@tanstack/react-query";
import { CertificatesClient } from "../../web-api-client.ts";

const useGetMyCertificates = (pageNumber = 1, pageSize = 10) => {
    return useQuery({
        queryKey: ["my-certificates", pageNumber, pageSize],
        queryFn: async () => {
            const client = new CertificatesClient();
            return await client.getMyCertificates(pageNumber, pageSize);
        },
        keepPreviousData: true,
    });
};

export default useGetMyCertificates;
