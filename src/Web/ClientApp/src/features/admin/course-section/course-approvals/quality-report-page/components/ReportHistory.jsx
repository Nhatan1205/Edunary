import { Box, Card, Typography, Grid, Paper } from "@mui/material";
import { formatShortDate } from "../../../../../../utils/helpers";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

export default function ReportHistory({
  reports = [],
  currentReportId,
  onSelectReport
}) {
  if (!reports || reports.length <= 1) {
    return null; // Don't show history if there is only 1 or 0 reports
  }

  // Sort reports by created date descending
  const sortedReports = [...reports].sort((a, b) => new Date(b.created) - new Date(a.created));

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: // Processing
        return <HourglassEmptyIcon sx={{ fontSize: 16, color: "warning.main" }} />;
      case 1: // Completed
        return <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "success.main" }} />;
      case 2: // Failed
      default:
        return <ErrorOutlineIcon sx={{ fontSize: 16, color: "error.main" }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Processing";
      case 1: return "Completed";
      case 2: return "Failed";
      default: return "Unknown";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        bgcolor: "background.paper"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <HistoryIcon sx={{ color: "text.secondary" }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
          Check History
        </Typography>
        <Typography variant="caption" sx={{ color: "text.tertiary", fontWeight: 600 }}>
          ({reports.length} runs)
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {sortedReports.map((r) => {
          const isCurrent = Number(r.id) === Number(currentReportId);
          const score = r.overallScore ?? 0;

          const getScoreColor = (val) => {
            if (val >= 80) return "success.main";
            if (val >= 50) return "warning.main";
            return "error.main";
          };

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={r.id}>
              <Card
                elevation={0}
                onClick={() => !isCurrent && onSelectReport(r.id)}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: isCurrent ? "brand.main" : "divider",
                  borderWidth: isCurrent ? "2px" : "1px",
                  borderRadius: "12px",
                  cursor: isCurrent ? "default" : "pointer",
                  bgcolor: isCurrent ? "background.surface" : "background.paper",
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": !isCurrent ? {
                    borderColor: "brand.light",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    transform: "translateY(-1px)"
                  } : {}
                }}
              >
                {/* Report Number / Date */}
                <Typography variant="caption" sx={{ color: "text.tertiary", display: "block", mb: 0.5, fontWeight: 600 }}>
                  Report #{r.id} • {formatShortDate(r.created)}
                </Typography>

                {/* Score and Status */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: getScoreColor(score) }}>
                    {r.status === 1 ? `${Math.round(score)}%` : "—"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {getStatusIcon(r.status)}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      {getStatusText(r.status)}
                    </Typography>
                  </Box>
                </Box>

              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
