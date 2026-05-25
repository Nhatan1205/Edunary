import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  IconButton,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DOMPurify from "dompurify";

export default function HtmlDiffModal({ open, onClose, field, oldValue, newValue }) {
  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5, bgcolor: "background.paper", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Compare Content: {field}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#F8F9FA", borderRadius: "12px", border: "1px solid #E5E7EB", height: "100%", minHeight: "200px" }}>
                <Chip label="APPROVED VERSION" color="default" variant="outlined" size="small" sx={{ fontWeight: 700, mb: 2 }} />
                {oldValue ? (
                  <Box
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(oldValue) }}
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      lineHeight: 1.6,
                      "& p": { mb: 1.5 },
                      "& ul": { pl: 2, mb: 1.5 },
                      "& li": { mb: 0.5 },
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                    No content (empty)
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: "#F8F9FA", borderRadius: "12px", border: "1px solid #E5E7EB", height: "100%", minHeight: "200px" }}>
                <Chip label="UPDATED VERSION" color="primary" variant="outlined" size="small" sx={{ fontWeight: 700, mb: 2, color: "brand.dark", borderColor: "brand.light" }} />
                {newValue ? (
                  <Box
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newValue) }}
                    sx={{
                      fontSize: "0.875rem",
                      color: "brand.dark",
                      lineHeight: 1.6,
                      "& p": { mb: 1.5 },
                      "& ul": { pl: 2, mb: 1.5 },
                      "& li": { mb: 0.5 },
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                    No content (empty)
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Modal>
  );
}
