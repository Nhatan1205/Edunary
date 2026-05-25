import { Box, Typography, Card, Grid, Chip, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CompareIcon from "@mui/icons-material/Compare";

export default function LandingPageComparison({ changes, onCompareClick }) {
  if (!changes.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          No Landing Page fields have been changed.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {changes.map((change, index) => {
        if (change.field === "Topics") {
          return (
            <Card key={index} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "none", bgcolor: "#FFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Associated Topics
                </Typography>
                <Chip label="Modified" size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {change.details?.map((detail, dIdx) => {
                  const isAdded = detail.type === "added";
                  return (
                    <Chip
                      key={dIdx}
                      icon={null}
                      label={isAdded ? `${detail.value} (Added)` : `${detail.value} (Removed)`}
                      color={isAdded ? "primary" : "default"}
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 28, color: isAdded ? "brand.dark" : "text.secondary" }}
                    />
                  );
                })}
              </Box>
            </Card>
          );
        }

        const isHtml = ["Description"].includes(change.field);
        const isImage = change.field === "Course Image";

        return (
          <Card key={index} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "none", bgcolor: "#FFF" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {change.field}
              </Typography>
              <Chip label="Modified" size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
            </Box>

            {change.summary && (
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontStyle: "italic" }}>
                {change.summary}
              </Typography>
            )}

            {isImage ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "text.tertiary", fontWeight: 700 }}>APPROVED VERSION</Typography>
                  <Box sx={{ mt: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB", maxHeight: 180 }}>
                    <img src={change.oldValue} alt="Before" style={{ width: "100%", height: "auto", display: "block" }} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700 }}>UPDATED VERSION</Typography>
                  <Box sx={{ mt: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB", maxHeight: 180 }}>
                    <img src={change.newValue} alt="After" style={{ width: "100%", height: "auto", display: "block" }} />
                  </Box>
                </Grid>
              </Grid>
            ) : isHtml ? (
              <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  size="small"
                  onClick={() => onCompareClick(change.field, change.oldValue, change.newValue)}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                >
                  Compare Content Side-by-Side
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "grey.50", border: "1px solid #F3F4F6" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>
                    APPROVED VERSION
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {change.oldValue || "—"}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "brand.lighter", border: "1px solid", borderColor: "brand.light" }}>
                  <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block", mb: 0.5 }}>
                    UPDATED VERSION
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                    {change.newValue || "—"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        );
      })}
    </Box>
  );
}
