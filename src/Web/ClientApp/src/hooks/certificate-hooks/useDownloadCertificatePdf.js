import { useState } from 'react';
import { CertificatesClient } from '../../web-api-client.ts';
import { toast } from 'react-toastify';

const useDownloadCertificatePdf = () => {
    const [downloadingCertId, setDownloadingCertId] = useState(null);

    const downloadPdf = async (certificateNumber) => {
        setDownloadingCertId(certificateNumber);
        try {
            const client = new CertificatesClient();
            const response = await client.downloadCertificate(certificateNumber);

            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${certificateNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download certificate. Please try again.');
        } finally {
            setDownloadingCertId(null);
        }
    };

    return { downloadPdf, downloadingCertId };
};

export default useDownloadCertificatePdf;
