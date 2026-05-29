import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Skeleton, Chip } from '@mui/material';
import { WorkspacePremium, Download, Visibility } from '@mui/icons-material';
import useGetMyCertificates from '../../../../hooks/certificate-hooks/useGetMyCertificates';
import useGetCertificate from '../../../../hooks/certificate-hooks/useGetCertificate';
import useDownloadCertificatePdf from '../../../../hooks/certificate-hooks/useDownloadCertificatePdf';
import CertificateModal from '../../../../components/CertificateModal';
import CustomPagination from '../../../../components/pagination/CustomPagination';

const CertificateViewer = ({ courseId, open, onClose }) => {
  const { data: certificate } = useGetCertificate(courseId);

  return (
    <CertificateModal 
      open={open} 
      onClose={onClose} 
      certificate={certificate} 
    />
  );
};

function Certifications() {
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading } = useGetMyCertificates(pageNumber, 10);
  const [viewingCourseId, setViewingCourseId] = useState(null);
  const { downloadPdf, downloadingCertId } = useDownloadCertificatePdf();

  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const certificates = data?.items || [];

  if (certificates.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
        <WorkspacePremium sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.primary" fontWeight={600}>
          No Certificates Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Complete courses to earn your certificates and showcase your skills!
        </Typography>
        <Button variant="contained" href="/" color="primary">
          Explore Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={4}>
        {certificates.map((cert) => (
          <Grid item xs={12} md={6} lg={4} key={cert.certificateNumber}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ 
                  height: 160, 
                  background: 'linear-gradient(135deg, rgba(0, 167, 111, 0.2) 0%, rgba(0, 167, 111, 0.05) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <WorkspacePremium sx={{ fontSize: 64, color: 'brand.main', opacity: 0.8 }} />
                </Box>
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  <Chip 
                    icon={<WorkspacePremium sx={{ fontSize: 16 }} />} 
                    label="Certified" 
                    color="success" 
                    size="small" 
                    sx={{ fontWeight: 600, bgcolor: 'background.paper', color: 'success.main', boxShadow: 1 }} 
                  />
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cert.courseTitleSnapshot}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Issued: {new Date(cert.completedDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                </Typography>
                
                <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', mb: 3 }}>
                  ID: {cert.certificateNumber}
                </Typography>
                
                <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Visibility />} 
                    fullWidth
                    onClick={() => setViewingCourseId(cert.courseId)}
                    sx={{ borderRadius: 2 }}
                  >
                    View
                  </Button>
                  <Button 
                    onClick={() => downloadPdf(cert.certificateNumber)}
                    disabled={downloadingCertId === cert.certificateNumber}
                    variant="contained" 
                    startIcon={downloadingCertId === cert.certificateNumber ? null : <Download />} 
                    fullWidth
                    sx={{ borderRadius: 2, bgcolor: 'brand.main', '&:hover': { bgcolor: 'brand.dark' } }}
                  >
                    {downloadingCertId === cert.certificateNumber ? 'Downloading...' : 'PDF'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {data?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CustomPagination 
            count={data.totalPages} 
            page={pageNumber} 
            onChange={handlePageChange} 
          />
        </Box>
      )}

      {viewingCourseId && (
        <CertificateViewer 
          courseId={viewingCourseId} 
          open={!!viewingCourseId} 
          onClose={() => setViewingCourseId(null)} 
        />
      )}
    </Box>
  );
}

export default Certifications;