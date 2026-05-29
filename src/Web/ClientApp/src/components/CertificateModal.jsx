import { Dialog, Box, Typography, Button, IconButton, useTheme, Divider } from "@mui/material";
import { Close, Download, WorkspacePremium, CheckCircle } from "@mui/icons-material";
import useDownloadCertificatePdf from "../hooks/certificate-hooks/useDownloadCertificatePdf";

const pulse = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 167, 111, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 167, 111, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 167, 111, 0);
    }
  }
`;

function CertificateModal({ open, onClose, certificate }) {
  const theme = useTheme();
  const { downloadPdf, downloadingCertId } = useDownloadCertificatePdf();
  const isDownloading = downloadingCertId === certificate?.certificateNumber;

  if (!certificate) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, overflow: "hidden" } } }}>
      <Box sx={{ position: "relative", bgcolor: "background.paper", p: { xs: 3, md: 5 }, overflow: "hidden" }}>
        <style>{pulse}</style>
        
        {/* Background Decorative Elements */}
        <Box sx={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", bgcolor: "brand.main", opacity: 0.1, filter: "blur(40px)" }} />
        <Box sx={{ position: "absolute", bottom: -100, left: -100, width: 300, height: 300, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.1, filter: "blur(40px)" }} />
        
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 16, right: 16, zIndex: 10, bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "action.hover" } }}>
          <Close />
        </IconButton>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Box sx={{ mb: 3, p: 2, borderRadius: "50%", bgcolor: "brand.lighter", color: "brand.main", animation: "pulse 2s infinite" }}>
            <WorkspacePremium sx={{ fontSize: 64 }} />
          </Box>
          
          <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary", mb: 1, fontFamily: "serif" }}>
            Certificate of Completion
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 4, letterSpacing: 1, textTransform: "uppercase" }}>
            Edunary Learning Platform
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
            This is to certify that
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 3, borderBottom: "2px solid", borderColor: "brand.main", pb: 1, px: 3 }}>
            {certificate.studentNameSnapshot}
          </Typography>

          <Typography variant="body1" sx={{ color: "text.secondary", mb: 1 }}>
            has successfully completed the course
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 4, maxWidth: "80%" }}>
            {certificate.courseTitleSnapshot}
          </Typography>

          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", mt: 4, px: { xs: 2, md: 8 } }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "signature, cursive", mb: 1 }}>
                {certificate.instructorNameSnapshot}
              </Typography>
              <Divider sx={{ mb: 1, borderColor: "divider" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>
                Instructor
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {new Date(certificate.completedDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </Typography>
              <Divider sx={{ mb: 1, borderColor: "divider" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}>
                Date Issued
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 6, display: "flex", alignItems: "center", gap: 1, p: 2, bgcolor: "background.neutral", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
            <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Certificate ID: <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>{certificate.certificateNumber}</Box>
            </Typography>
          </Box>

          <Button
            onClick={() => downloadPdf(certificate.certificateNumber)}
            disabled={isDownloading}
            variant="contained"
            startIcon={isDownloading ? null : <Download />}
            sx={{
              mt: 4,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              bgcolor: "brand.main",
              boxShadow: theme.shadows[4],
              "&:hover": {
                bgcolor: "brand.dark",
                boxShadow: theme.shadows[8],
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Download High-Quality PDF
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default CertificateModal;
