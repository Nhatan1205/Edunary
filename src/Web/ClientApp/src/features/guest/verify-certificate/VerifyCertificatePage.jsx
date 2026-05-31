import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, CircularProgress, Divider } from '@mui/material';
import { WorkspacePremium, CheckCircle, ErrorOutline, Search } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import useVerifyCertificate from '../../../hooks/certificate-hooks/useVerifyCertificate';

function VerifyCertificatePage() {
  const { certificateNumber: initialCertNumber } = useParams();
  const navigate = useNavigate();

  // Always maintain local state for input, defaulting to URL param if available
  const [searchInput, setSearchInput] = useState(initialCertNumber || '');

  // Pass the actual URL parameter to the hook so it only fetches based on URL state
  const { data: certificate, isLoading, isError } = useVerifyCertificate(initialCertNumber);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/certificate/verify/${searchInput.trim()}`);
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: 'background.default', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: 'brand.lighter', color: 'brand.main', mb: 2, boxShadow: 2 }}>
            <WorkspacePremium sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h3" fontWeight={800} mb={2} color="text.primary">
            Certificate Verification
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" maxWidth="600px" mx="auto">
            Edunary certificates represent verified achievement. Enter a certificate number below to confirm its authenticity.
          </Typography>
        </Box>

        <Paper component="form" onSubmit={handleSearch} sx={{ p: 1, display: 'flex', alignItems: 'center', maxWidth: 600, mx: 'auto', mb: 6, borderRadius: 3, boxShadow: 3, border: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="e.g. UC-2026-ABCDEF12"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            variant="outlined"
            sx={{ '& fieldset': { border: 'none' } }}
          />
          <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 2, px: 4, py: 1.5, bgcolor: 'brand.main', boxShadow: 2, '&:hover': { bgcolor: 'brand.dark', boxShadow: 4 } }} startIcon={<Search />}>
            Verify
          </Button>
        </Paper>

        {initialCertNumber && (
          <Box sx={{ mt: 4, animation: 'fadeIn 0.5s ease' }}>
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : isError || !certificate || !certificate.certificateNumber ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid', borderColor: 'error.light', bgcolor: '#fff5f5' }}>
                <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={700} color="error.dark" mb={1}>
                  Invalid Certificate
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We could not find a certificate matching the number <Box component="span" fontWeight={600}>"{initialCertNumber}"</Box>. Please check the number and try again.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, position: 'relative', overflow: 'hidden', boxShadow: 6, border: '1px solid', borderColor: 'divider' }}>
                {/* Decorative backgrounds */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'success.main', opacity: 0.05 }} />
                <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, borderRadius: '50%', bgcolor: 'brand.main', opacity: 0.05 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      Verified Certificate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This certificate is authentic and officially issued by Edunary.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} fontWeight={600}>
                      Recipient
                    </Typography>
                    <Typography variant="h4" fontWeight={800} mt={1} color="text.primary">
                      {certificate.studentNameSnapshot}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} fontWeight={600}>
                      Course Completed
                    </Typography>
                    <Typography variant="h5" fontWeight={700} mt={1} color="brand.dark">
                      {certificate.courseTitleSnapshot}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} fontWeight={600}>
                        Instructor
                      </Typography>
                      <Typography variant="h6" fontWeight={600} mt={0.5} color="text.primary">
                        {certificate.instructorNameSnapshot}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} fontWeight={600}>
                        Issue Date
                      </Typography>
                      <Typography variant="h6" fontWeight={600} mt={0.5} color="text.primary">
                        {new Date(certificate.completedDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} fontWeight={600}>
                        Certificate ID
                      </Typography>
                      <Typography variant="h6" fontWeight={600} mt={0.5} sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                        {certificate.certificateNumber}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default VerifyCertificatePage;
