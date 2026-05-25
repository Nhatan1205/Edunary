import { Box, Typography, Card, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PricingComparison({ changes }) {
  if (!changes.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          No pricing changes detected.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {changes.map((change, index) => (
        <Card key={index} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "none", bgcolor: "#FFF" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {change.field}
            </Typography>
            <Chip label="Modified" size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
          </Box>

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
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>
                {change.newValue || "—"}
              </Typography>
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
