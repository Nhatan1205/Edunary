import { Box, Typography, Grid, LinearProgress, CircularProgress, Paper, Chip } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

export default function ScoreOverview({ report }) {
  if (!report) return null;

  const score = report.overallScore ?? 0;

  // Determine overall score color scheme
  const getScoreColors = (val) => {
    if (val >= 80) return { main: "success.main", bg: "rgba(46, 125, 50, 0.08)", text: "Excellent" };
    if (val >= 50) return { main: "warning.main", bg: "rgba(237, 108, 2, 0.08)", text: "Needs Improvement" };
    return { main: "error.main", bg: "rgba(211, 47, 47, 0.08)", text: "Critical Quality Issues" };
  };

  const scoreColors = getScoreColors(score);

  // Category scores mapping
  const categoryScores = report.categoryScores ?? {};
  const categories = [
    { key: "LearningObjectives", label: "Learning Objectives", desc: "Clarity, alignment and count of objectives" },
    { key: "LandingPage", label: "Landing Page Quality", desc: "Title, subtitle, cover and rich details" },
    { key: "CourseContent", label: "Curriculum & Lectures", desc: "Lecture content, video subtitles, assessments" },
    { key: "Policy", label: "Policy Compliance", desc: "Pricing, policy guidelines and promo rules" }
  ];

  const getLinearColor = (val) => {
    if (val >= 80) return "success";
    if (val >= 50) return "warning";
    return "error";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper"
      }}
    >
      <Grid container spacing={{ xs: 4, md: 5 }}>
        {/* Left Column: Overall Gauge & Stats */}
        <Grid 
          size={{ xs: 12, md: 4 }}
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            borderRight: { md: "1px solid" }, 
            borderColor: "divider",
            pr: { md: 5 }
          }}
        >
          <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={130}
              thickness={5}
              sx={{ color: "background.muted" }}
            />
            <CircularProgress
              variant="determinate"
              value={score}
              size={130}
              thickness={5}
              sx={{
                color: scoreColors.main,
                position: "absolute",
                left: 0,
                strokeLinecap: "round"
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                {Math.round(score)}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.tertiary", textTransform: "uppercase", mt: 0.5, fontSize: "0.68rem" }}>
                Quality Score
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 2.5, py: 0.75, borderRadius: "20px", bgcolor: scoreColors.bg, textAlign: "center", mb: 2.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: scoreColors.main }}>
              {scoreColors.text}
            </Typography>
          </Box>

          {/* Stats Chips underneath score gauge */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: 13 }} />}
              label={`${report.criticalCount ?? 0} Critical`}
              color="error"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700, borderRadius: "4px", height: 20, fontSize: "0.65rem" }}
            />
            <Chip
              icon={<WarningIcon sx={{ fontSize: 13 }} />}
              label={`${report.warningCount ?? 0} Warning`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700, borderRadius: "4px", height: 20, fontSize: "0.65rem" }}
            />
            <Chip
              icon={<InfoIcon sx={{ fontSize: 13 }} />}
              label={`${report.suggestionCount ?? 0} Suggestion`}
              color="info"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700, borderRadius: "4px", height: 20, fontSize: "0.65rem" }}
            />
          </Box>
        </Grid>

        {/* Right Column: Category Breakdown (2 Rows, 2 Columns) */}
        <Grid 
          size={{ xs: 12, md: 8 }}
          sx={{ 
            pl: { md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 3 }}>
            Category Breakdown
          </Typography>

          <Grid container spacing={3.5}>
            {categories.map((cat) => {
              const val = categoryScores[cat.key] ?? 100;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={cat.key}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {cat.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: `${getLinearColor(val)}.main` }}>
                      {Math.round(val)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={val}
                    color={getLinearColor(val)}
                    sx={{ height: 6, borderRadius: "3px", bgcolor: "background.muted" }}
                  />
                  <Typography variant="caption" sx={{ color: "text.tertiary", mt: 0.5, display: "block", fontSize: "0.72rem" }}>
                    {cat.desc}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      {/* Analysis Summary */}
      {report.analysisSummary && (
        <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
            AI Quality Analysis Summary
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "text.primary", 
              lineHeight: 1.8, 
              fontSize: "1.05rem",
              fontWeight: 500,
              wordBreak: "break-word" 
            }}
          >
            {report.analysisSummary}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
