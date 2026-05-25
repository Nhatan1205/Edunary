import { Box, Typography, Card, Chip, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CompareIcon from "@mui/icons-material/Compare";

export default function CourseMessagesComparison({ changes, onCompareClick }) {
  if (!changes.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          No welcome or congratulations message changes.
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

          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            size="small"
            onClick={() => onCompareClick(change.field, change.oldValue, change.newValue)}
            sx={{ borderRadius: "8px", fontWeight: 600, mt: 1 }}
          >
            Compare Messages Side-by-Side
          </Button>
        </Card>
      ))}
    </Box>
  );
}
