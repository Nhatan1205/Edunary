import { useQuery } from '@tanstack/react-query';
import { CertificatesClient } from '../../web-api-client.ts';

export default function useVerifyCertificate(certificateNumber) {
  return useQuery({
    queryKey: ['verifyCertificate', certificateNumber],
    queryFn: async () => {
      if (!certificateNumber) return null;
      const client = new CertificatesClient();
      return await client.verifyCertificate(certificateNumber);
    },
    enabled: !!certificateNumber,
    retry: false
  });
}
