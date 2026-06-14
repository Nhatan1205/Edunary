import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Card,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  Divider,
  Collapse,
  Grid
} from "@mui/material";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DOMPurify from "dompurify";

import useGetInstructorQualityReports from "../../../../../hooks/course-review-hooks/useGetInstructorQualityReports";
import useGetInstructorQualityReportDetail from "../../../../../hooks/course-review-hooks/useGetInstructorQualityReportDetail";
import useRunInstructorQualityCheck from "../../../../../hooks/course-review-hooks/useRunInstructorQualityCheck";
import useQualityCheckProgress from "../../../../../hooks/course-review-hooks/useQualityCheckProgress";
import NoData from "../../../../../components/NoData";
import AlertBox from "../../../../../components/AlertBox";

import emptyAuditImg from "../../../../../assets/images/empty-audit.png";

// ── Severity configuration ──
const SEVERITY_CONFIG = {
  0: { label: "Critical", color: "error", borderLeft: "4px solid #f44336" }, // Critical
  1: { label: "Warning", color: "warning", borderLeft: "4px solid #ff9800" }, // Warning
  2: { label: "Suggestion", color: "info", borderLeft: "4px solid #2196f3" } // Suggestion
};

// ── Score Color Helpers ──
const getScoreColor = (val) => {
  if (val >= 80) return "success.main";
  if (val >= 50) return "warning.main";
  return "error.main";
};

const getLinearColor = (val) => {
  if (val >= 80) return "success";
  if (val >= 50) return "warning";
  return "error";
};

// ── Category Config ──
const CATEGORIES = [
  {
    key: "LearningObjectives",
    label: "Learning Objectives",
    desc: "Course & section objective alignment"
  },
  {
    key: "LandingPage",
    label: "Landing Page Info",
    desc: "Metadata, title, requirements & description"
  },
  {
    key: "CourseContent",
    label: "Curriculum & Lectures",
    desc: "Lecture content, video captions & quizzes"
  },
  {
    key: "Policy",
    label: "Policy Compliance",
    desc: "Pricing, copyright & promotional rules"
  }
];

// ── Issue Card component ──
function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(true);
  const sevCfg = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG[2];

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderLeft: sevCfg.borderLeft,
        borderRadius: 0,
        mb: 2,
        bgcolor: "background.paper",
        transition: "all 0.2s ease",
        overflow: "hidden"
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: "background.alt" }
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Chip
            label={sevCfg.label}
            color={sevCfg.color}
            size="small"
            sx={{ fontWeight: 700, borderRadius: "5px", height: 22, fontSize: "0.7rem" }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {issue.location || "General"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </Box>
      </Box>

      {/* Card Body */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, pb: 3, pt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
              Issue Description
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.primary",
                mt: 0.5,
                lineHeight: 1.6,
                "& ul": { mt: 0.5, pl: 2.5 },
                "& li": { mb: 0.25 },
                "& p": { m: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(issue.description) }}
            />
          </Box>

          {issue.suggestion && (
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main", textTransform: "uppercase", display: "block", mb: 0.5 }}>
                Suggestion for improvement
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                {issue.suggestion}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Report History Item ──
function HistoryReportItem({ item, active, onClick }) {
  const score = item.overallScore ?? 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        py: 1.75,
        bgcolor: active ? "brand.lighter" : "background.paper",
        border: "1px solid",
        borderColor: active ? "brand.main" : "divider",
        borderRadius: "8px",
        cursor: "pointer",
        mb: 1.5,
        transition: "all 0.2s ease",
        "&:hover": { borderColor: "brand.main", bgcolor: active ? "brand.lighter" : "action.hover" }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: active ? "brand.main" : "text.primary" }}>
          Report #{item.id} {item.isLatest && <Chip label="Latest" size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, ml: 1 }} />}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {new Date(item.created).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 800, color: getScoreColor(score) }}>
          Score: {Math.round(score)}%
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
          {item.totalIssues} {item.totalIssues === 1 ? "issue" : "issues"}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Instructor Score Overview Card ──
function InstructorScoreOverview({ report }) {
  if (!report) return null;

  const score = report.overallScore ?? 0;
  const categoryScores = report.categoryScores ?? {};

  return (
    <Box sx={{ mb: 5 }}>
      <Grid container spacing={{ xs: 3, sm: 4 }} alignItems="stretch">
        {/* Left Column: Overall Quality Gauge */}
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
              textAlign: "center",
              pt: 0,
              pb: 0.5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 2
              }}
            >
              Overall Quality Score
            </Typography>

            <Box sx={{ position: "relative", display: "inline-flex", my: { xs: 2, sm: 0 } }}>
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
                  color: getScoreColor(score),
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
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {Math.round(score)}%
                </Typography>
              </Box>
            </Box>

            {/* Counts breakdown */}
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", alignItems: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>
                {report.criticalCount ?? 0} Critical
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>•</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.main" }}>
                {report.warningCount ?? 0} Warnings
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>•</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "info.main" }}>
                {report.suggestionCount ?? 0} Suggestions
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Category Quality Breakdown (2x2 grid of cards, compact, no icons) */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mb: 2, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Category Quality Breakdown
          </Typography>

          <Grid container spacing={2}>
            {CATEGORIES.map((cat) => {
              const val = categoryScores[cat.key] ?? 100;
              const hasIssues = val < 100;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={cat.key}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.88rem" }}>
                        {cat.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontSize: "0.72rem", mt: 0.25, lineHeight: 1.2 }}>
                        {cat.desc}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: hasIssues ? "warning.main" : "success.main", fontWeight: 700, fontSize: "0.72rem" }}>
                          {hasIssues ? "Review needed" : "Perfect score"}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: `${getLinearColor(val)}.main`, fontSize: "0.82rem" }}>
                          {Math.round(val)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={val}
                        color={getLinearColor(val)}
                        sx={{
                          height: 4,
                          borderRadius: "2px",
                          bgcolor: "background.muted"
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Main Page Component ──
export default function InstructorQualityReportPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeReportId, setActiveReportId] = useState(null);

  // Queries & Mutations
  const { data: reportsList, isLoading: isListLoading, refetch: refetchReports } = useGetInstructorQualityReports(Number(courseId));
  const { data: reportDetail, isLoading: isDetailLoading } = useGetInstructorQualityReportDetail(activeReportId);
  const runMutation = useRunInstructorQualityCheck();

  // Progress logic
  const [isChecking, setIsChecking] = useState(false);
  const progress = useQualityCheckProgress(isChecking);

  // Automatically select latest report if none selected
  useEffect(() => {
    if (reportsList && reportsList.length > 0 && !activeReportId) {
      // Find latest completed/failed or just first
      const sorted = [...reportsList].sort((a, b) => b.id - a.id);
      setActiveReportId(sorted[0].id);
    }
  }, [reportsList, activeReportId]);

  // Monitor SignalR progress and reload on 100%
  useEffect(() => {
    if (progress.percent === 100) {
      const timer = setTimeout(() => {
        setIsChecking(false);
        // Invalidate caches to fetch fresh completed reports and details
        queryClient.invalidateQueries(["instructor-quality-reports", Number(courseId)]);
        queryClient.invalidateQueries(["instructor-quality-report-detail", progress.reportId || activeReportId]);
        refetchReports().then(({ data }) => {
          const sorted = data ? [...data].sort((a, b) => b.id - a.id) : [];
          if (sorted.length > 0) {
            setActiveReportId(progress.reportId || sorted[0].id);
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (progress.percent === -1) {
      setIsChecking(false);
    }
  }, [progress.percent, progress.reportId, refetchReports, courseId, queryClient, activeReportId]);

  // Calculate cooldown rate limit status
  const latestReport = useMemo(() => {
    if (!reportsList || reportsList.length === 0) return null;
    return [...reportsList].sort((a, b) => b.id - a.id)[0];
  }, [reportsList]);

  const rateLimitStatus = useMemo(() => {
    if (!latestReport?.nextRunAvailableAt) return { isRestricted: false };
    const nextAvailable = new Date(latestReport.nextRunAvailableAt);
    const now = new Date();
    const isRestricted = nextAvailable > now;

    // Calculate days/hours left
    const diffMs = nextAvailable - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      isRestricted,
      nextAvailable,
      formattedTime: nextAvailable.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      timeLeft: diffDays > 0 ? `${diffDays} days ${diffHours} hours` : `${diffHours} hours`
    };
  }, [latestReport]);

  const handleRunCheck = () => {
    if (!courseId) return;
    setIsChecking(true);
    runMutation.mutate(Number(courseId), {
      onSuccess: () => {
        refetchReports();
      },
      onError: () => {
        setIsChecking(false);
      }
    });
  };

  if (isListLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={36} sx={{ color: "brand.main" }} />
      </Box>
    );
  }

  // ── Render Checking / SignalR Progress State ──
  if (isChecking) {
    return (
      <Box sx={{ maxWidth: 820, mx: "auto", py: 4 }}>
        <Card
          elevation={0}
          sx={{
            p: 5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            textAlign: "center",
            bgcolor: "background.paper",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Running AI Quality Audit...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.percent}
            sx={{
              height: 8,
              borderRadius: "4px",
              bgcolor: "background.muted",
              mb: 3,
              "& .MuiLinearProgress-bar": { bgcolor: "brand.main" }
            }}
          />
          <Typography variant="body2" sx={{ color: "brand.main", fontWeight: 700, mb: 1 }}>
            Progress: {progress.percent}%
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            {progress.message || "Generating structured feedback report..."}
          </Typography>
        </Card>
      </Box>
    );
  }

  // ── Render Empty / No Reports State ──
  if (!reportsList || reportsList.length === 0) {
    return (
      <Box sx={{ maxWidth: 820, mx: "auto", py: 2 }}>
        <Card
          elevation={0}
          sx={{
            p: 5,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: "12px",
            textAlign: "center",
            bgcolor: "background.paper"
          }}
        >
          <NoData
            image={emptyAuditImg}
            title="Try our new AI Quality Check!"
            description="Try our new AI tool to inspect your course structure, curriculum, and formatting details before submitting it for review!"
            minHeight="280px"
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleRunCheck}
              disabled={runMutation.isPending}
              startIcon={<AssessmentOutlinedIcon />}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "brand.main",
                px: 4,
                py: 1.5,
                boxShadow: "none",
                "&:hover": { bgcolor: "brand.dark", boxShadow: "none" }
              }}
            >
              {runMutation.isPending ? "Starting Audit..." : "Run AI Quality Check"}
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      {/* Cooldown Alert & Action Block */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          p: 2.5,
          bgcolor: "background.surface",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, maxWidth: "70%" }}>
          <ScheduleIcon sx={{ color: rateLimitStatus.isRestricted ? "warning.main" : "success.main", mt: 0.25 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              AI Review Availability
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
              {rateLimitStatus.isRestricted
                ? `Your next AI review will be available in ${rateLimitStatus.timeLeft} (after ${rateLimitStatus.formattedTime}).`
                : "Ready for your next course review! Click the button to inspect your latest updates."}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          disabled={runMutation.isPending || rateLimitStatus.isRestricted}
          onClick={handleRunCheck}
          startIcon={<AssessmentOutlinedIcon />}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 700,
            bgcolor: rateLimitStatus.isRestricted ? "action.disabledBackground" : "brand.main",
            boxShadow: "none",
            "&:hover": { bgcolor: "brand.dark", boxShadow: "none" }
          }}
        >
          {runMutation.isPending ? "Running..." : "Run AI Quality Check"}
        </Button>
      </Box>

      {/* Selected Report Detail View */}
      {isDetailLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : reportDetail ? (
        <Box sx={{ mb: 5 }}>
          {/* Score Overview */}
          <InstructorScoreOverview report={reportDetail} />

          {/* Analysis Summary */}
          {reportDetail.analysisSummary && (
            <AlertBox
              severity="info"
              title="Overall Summary"
              sx={{ mb: 4 }}
            >
              {reportDetail.analysisSummary}
            </AlertBox>
          )}

          {/* Issues Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Issues ({reportDetail.issues.length})
            </Typography>

            {reportDetail.issues.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: "8px",
                  bgcolor: "background.paper"
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Perfect score! AI found zero quality issues for this report.
                </Typography>
              </Box>
            ) : (
              reportDetail.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            )}
          </Box>
        </Box>
      ) : (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load the selected report detail.
        </Alert>
      )}

      {/* Report History List at Bottom */}
      {reportsList.length > 1 && (
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
            Report History ({reportsList.length})
          </Typography>
          {reportsList.map((item) => (
            <HistoryReportItem
              key={item.id}
              item={item}
              active={activeReportId === item.id}
              onClick={() => setActiveReportId(item.id)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
