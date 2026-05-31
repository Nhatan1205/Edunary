import { Box, Typography, Chip, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

export const CATEGORY_LABELS = {
  0: "Course Content",
  1: "Video Quality",
  2: "Audio Quality",
  3: "Course Landing Page",
  4: "Course Image",
  5: "Course Title / Subtitle",
  6: "Course Description",
  7: "Intended Learners",
  8: "Instructor Profile",
  9: "Policy",
  10: "Pricing",
  99: "Other"
};

export default function IssueCard({
  issue,
  onAccept,
  onDismiss,
  isAccepting = false,
  isDismissing = false
}) {
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 0: // Critical
        return {
          label: "Critical",
          color: "error",
          icon: <ErrorIcon sx={{ fontSize: 13 }} />,
          leftBorder: "4px solid #d32f2f"
        };
      case 1: // Warning
        return {
          label: "Warning",
          color: "warning",
          icon: <WarningIcon sx={{ fontSize: 13 }} />,
          leftBorder: "4px solid #ed6c02"
        };
      case 2: // Suggestion
      default:
        return {
          label: "Suggestion",
          color: "info",
          icon: <InfoIcon sx={{ fontSize: 13 }} />,
          leftBorder: "4px solid #0288d9"
        };
    }
  };

  const severityStyle = getSeverityStyle(issue.severity);
  const categoryLabel = CATEGORY_LABELS[issue.category] || "Other";

  const isPending = issue.adminAction === 0;
  const isAccepted = issue.adminAction === 1;
  const isDismissed = issue.adminAction === 2;

  return (
    <Box
      sx={{
        p: 3,
        mb: 3.5, // Spacious gap between issues to prevent sticking together
        border: "1px solid",
        borderColor: "divider",
        borderLeft: severityStyle.leftBorder,
        borderRadius: "0 8px 8px 0",
        bgcolor: isAccepted ? "rgba(46, 125, 50, 0.01)" : "background.paper",
        opacity: isDismissed ? 0.6 : 1,
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Top Row: Severity, Category, and Location */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {/* Severity */}
          <Chip
            size="small"
            icon={severityStyle.icon}
            label={severityStyle.label}
            color={severityStyle.color}
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: "4px", fontSize: "0.68rem", height: 20 }}
          />

          {/* Category */}
          <Chip
            size="small"
            label={categoryLabel}
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: "4px", fontSize: "0.68rem", height: 20, borderColor: "divider", color: "text.secondary" }}
          />
        </Box>

        {/* Location (Right aligned) */}
        {issue.location && (
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem" }}>
            {issue.location}
          </Typography>
        )}
      </Box>

      {/* Description (Primary Focus - Centered & Bolded) */}
      <Typography
        variant="subtitle1"
        sx={{
          color: "text.primary",
          fontWeight: 700,
          lineHeight: 1.7,
          fontSize: "1.025rem",
          textDecoration: isDismissed ? "line-through" : "none",
          mb: 2
        }}
      >
        {issue.description}
      </Typography>

      {/* Evidence Quote (Subdued & Secondary) */}
      {issue.evidence && (
        <Box sx={{ pl: 2.5, borderLeft: "2px solid", borderColor: "divider", mb: 2.5, mt: 1.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.825rem", lineHeight: 1.7 }}>
            <strong>Evidence: </strong> "{issue.evidence}"
          </Typography>
        </Box>
      )}

      {/* Footer Actions & Reference info */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 2,
          mt: 2.5
        }}
      >
        {/* Policy reference ID (Moved to bottom left as secondary info) */}
        <Box>
          {issue.ruleId && (
            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.tertiary", fontWeight: 600, fontSize: "0.72rem" }}>
              Policy Ref: {issue.ruleId}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isAccepted && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                Add Feedback
              </Typography>
            </Box>
          )}

          {isDismissed && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
              <CancelIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.78rem" }}>
                Dismissed
              </Typography>
            </Box>
          )}

          {isPending && (
            <>
              <Button
                size="small"
                variant="text"
                color="inherit"
                disabled={isDismissing || isAccepting}
                onClick={() => onDismiss(issue.id)}
                sx={{
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  px: 2,
                  color: "text.secondary",
                  "&:hover": {
                    color: "error.main",
                    bgcolor: "rgba(211, 47, 47, 0.04)"
                  }
                }}
              >
                Dismiss
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={isDismissing || isAccepting}
                onClick={() => onAccept(issue.id)}
                sx={{
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  px: 2.5,
                  bgcolor: "brand.main",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "brand.dark",
                    boxShadow: "none"
                  }
                }}
              >
                Add Feedback
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
