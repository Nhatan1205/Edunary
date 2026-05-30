import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Button, Container, Card, CircularProgress, Alert, LinearProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

// Hooks for Quality report
import useGetQualityReportDetail from "../../../../../hooks/course-review-hooks/useGetQualityReportDetail";
import useGetQualityReports from "../../../../../hooks/course-review-hooks/useGetQualityReports";
import useRunQualityCheck from "../../../../../hooks/course-review-hooks/useRunQualityCheck";
import useAcceptQualityIssue from "../../../../../hooks/course-review-hooks/useAcceptQualityIssue";
import useDismissQualityIssue from "../../../../../hooks/course-review-hooks/useDismissQualityIssue";
import useQualityCheckProgress from "../../../../../hooks/course-review-hooks/useQualityCheckProgress";

// Hooks for Course Review (copied from CourseApprovalDetailPage)
import useGetCoursePreviewForAdmin from "../../../../../hooks/course-review-hooks/useGetCoursePreviewForAdmin";
import useGetCourseReviewStatus from "../../../../../hooks/course-review-hooks/useGetCourseReviewStatus";
import useSaveReviewFeedback from "../../../../../hooks/course-review-hooks/useSaveReviewFeedback";
import useDeleteReviewFeedback from "../../../../../hooks/course-review-hooks/useDeleteReviewFeedback";
import useUpdateReviewFeedback from "../../../../../hooks/course-review-hooks/useUpdateReviewFeedback";
import useRequestChanges from "../../../../../hooks/course-review-hooks/useRequestChanges";
import useApproveCourse from "../../../../../hooks/course-review-hooks/useApproveCourse";

// Components
import ScoreOverview from "./components/ScoreOverview";
import IssueFilters from "./components/IssueFilters";
import IssueCard from "./components/IssueCard";
import ReportHistory from "./components/ReportHistory";
import FeedbackDrawer from "../course-approval-detail-page/components/FeedbackDrawer";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import NoData from "../../../../../components/NoData";

// Assets
import emptyAuditImg from "../../../../../assets/images/empty-audit.png";

export default function QualityReportPage() {
  const { submissionId, reportId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isNoneReport = reportId === "none" || !reportId;

  const { data: previewData, isLoading: isPreviewLoading } = useGetCoursePreviewForAdmin(submissionId);
  const feedbacks = previewData?.currentFeedbacks ?? [];
  const submissionInfo = previewData?.submissionInfo;
  const course = previewData?.course ?? {};
  const courseId = course?.id;

  const { data: reviewStatusData } = useGetCourseReviewStatus(courseId);
  const submissionHistory = reviewStatusData?.submissionHistory ?? [];
  const { data: report, isLoading: isReportLoading, isError, error } = useGetQualityReportDetail(
    isNoneReport ? null : reportId
  );
  const { data: reportsHistory, refetch: refetchReports } = useGetQualityReports(courseId);
  const runMutation = useRunQualityCheck();
  const acceptMutation = useAcceptQualityIssue(reportId);
  const dismissMutation = useDismissQualityIssue(reportId);

  // Checking & SignalR State
  const [isChecking, setIsChecking] = useState(false);
  const progress = useQualityCheckProgress(isChecking);

  // If we are on "none" report but history is available and has reports, auto-redirect to latest
  useEffect(() => {
    if (isNoneReport && reportsHistory && reportsHistory.length > 0) {
      const sorted = [...reportsHistory].sort((a, b) => b.id - a.id);
      if (sorted.length > 0) {
        navigate(`/admin/course/approvals/${submissionId}/report/${sorted[0].id}`, { replace: true });
      }
    }
  }, [isNoneReport, reportsHistory, submissionId, navigate]);

  // Monitor SignalR updates
  useEffect(() => {
    if (progress.percent === 100) {
      const timer = setTimeout(() => {
        setIsChecking(false);
        refetchReports().then(({ data }) => {
          const sorted = data ? [...data].sort((a, b) => b.id - a.id) : [];
          const nextId = progress.reportId || (sorted.length > 0 ? sorted[0].id : "none");
          navigate(`/admin/course/approvals/${submissionId}/report/${nextId}`);
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (progress.percent === -1) {
      setIsChecking(false);
    }
  }, [progress.percent, progress.reportId, submissionId, refetchReports, navigate]);

  // Mutations for course review feedback
  const saveFeedbackMutation = useSaveReviewFeedback(submissionId);
  const deleteFeedbackMutation = useDeleteReviewFeedback(submissionId);
  const updateFeedbackMutation = useUpdateReviewFeedback(submissionId);
  const requestChangesMutation = useRequestChanges(submissionId);
  const approveMutation = useApproveCourse(submissionId);

  // Drawer / Dialog states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    severity: "all",
    status: "all"
  });

  // Calculate unresolved required fixes
  const requiredUnresolved = feedbacks.filter((f) => f.feedbackType === 0).length;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      severity: "all",
      status: "all"
    });
  };

  // Filtered Issues list calculation
  const filteredIssues = useMemo(() => {
    if (!report?.issues) return [];
    return report.issues.filter((issue) => {
      // 1. Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        return (
          (issue.description?.toLowerCase().includes(query)) ||
          (issue.ruleId?.toLowerCase().includes(query)) ||
          (issue.location?.toLowerCase().includes(query)) ||
          (issue.evidence?.toLowerCase().includes(query)) ||
          (issue.suggestion?.toLowerCase().includes(query))
        );
      }

      // 2. Category filter
      if (filters.category !== "all" && String(issue.category) !== filters.category) return false;

      // 3. Severity filter
      if (filters.severity !== "all" && String(issue.severity) !== filters.severity) return false;

      // 4. Status filter
      if (filters.status !== "all" && String(issue.adminAction) !== filters.status) return false;

      return true;
    });
  }, [report?.issues, filters]);

  // Handlers
  const handleAccept = (issueId) => {
    acceptMutation.mutate({ issueId }, {
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-course-preview", submissionId]);
        setDrawerOpen(true);
      }
    });
  };

  const handleDismiss = (issueId) => {
    dismissMutation.mutate(issueId);
  };

  const handleSelectReport = (selectedId) => {
    navigate(`/admin/course/approvals/${submissionId}/report/${selectedId}`);
  };

  const handleRunCheck = () => {
    if (!courseId) return;
    setIsChecking(true);
    runMutation.mutate(courseId, {
      onSuccess: () => {
        refetchReports();
      },
      onError: () => {
        setIsChecking(false);
      }
    });
  };

  const handleApprove = useCallback(() => {
    if (!submissionInfo?.submissionId) return;
    approveMutation.mutate(submissionInfo.submissionId, {
      onSuccess: () => {
        setApproveDialogOpen(false);
        navigate("/admin/course/approvals");
      },
    });
  }, [approveMutation, submissionInfo, navigate]);

  if ((isReportLoading && !isNoneReport) || isPreviewLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress size={50} sx={{ color: "brand.main" }} />
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Loading AI Quality check analysis report...
        </Typography>
      </Box>
    );
  }

  if (isError && !isNoneReport) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(submissionId ? `/admin/course/approvals/${submissionId}` : "/admin/course/approvals")}
          sx={{ textTransform: "none", color: "text.secondary", mb: 3 }}
        >
          Back to Submission details
        </Button>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error?.message || "Failed to load quality report. Please check if the report exists and is compiled."}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" }, py: 3 }}>
      {/* ── Page Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(submissionId ? `/admin/course/approvals/${submissionId}` : "/admin/course/approvals")}
            size="small"
            sx={{
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 600,
              pl: 0,
              mb: 1,
              "&:hover": { bgcolor: "transparent", color: "text.primary" }
            }}
          >
            Back to Review Submission
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
            AI Quality Report
          </Typography>
          <Typography variant="body2" sx={{ color: "text.tertiary", mt: 0.5, fontWeight: 500 }}>
            Detailed AI content audit report of course submissions for review and improvement feedback.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Re-run button shown only when a report is already loaded */}
          {!isNoneReport && !isChecking && (
            <Button
              variant="outlined"
              onClick={handleRunCheck}
              disabled={runMutation.isPending}
              startIcon={<AssessmentOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                borderColor: "divider",
                color: "text.primary",
                py: 1,
                "&:hover": { borderColor: "brand.main", color: "brand.main", bgcolor: "brand.lighter" }
              }}
            >
              {runMutation.isPending ? "Starting..." : "Run AI quality"}
            </Button>
          )}

          {/* Feedback & Actions Drawer Trigger */}
          {submissionId && (
            <Button variant="contained" id="open-feedback-drawer-btn"
              startIcon={<FeedbackOutlinedIcon />}
              onClick={() => setDrawerOpen(true)}
              sx={{
                textTransform: "none", fontWeight: 700, borderRadius: "10px", bgcolor: "brand.main",
                boxShadow: "none", "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
                display: "flex", alignItems: "center", gap: 1
              }}>
              Feedback &amp; Actions
              {feedbacks.length > 0 && (
                <Box
                  sx={{
                    px: 0.85,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    lineHeight: "18px",
                    bgcolor: "error.main",
                    color: "#fff",
                  }}
                >
                  {feedbacks.length}
                </Box>
              )}
            </Button>
          )}
        </Box>
      </Box>

      {/* ── 3. Main Report View/Trigger Area ── */}
      {isChecking ? (
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "420px"
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 480, textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
              Performing Content Quality Audit...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={{
                height: 8,
                borderRadius: "4px",
                bgcolor: "background.muted",
                mb: 2,
                "& .MuiLinearProgress-bar": { bgcolor: "brand.main" }
              }}
            />
            <Typography variant="body2" sx={{ color: "brand.main", fontWeight: 700, mb: 1 }}>
              Progress: {progress.percent}%
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              {progress.message}
            </Typography>
          </Box>
        </Card>
      ) : isNoneReport ? (
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "420px"
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <NoData
              image={emptyAuditImg}
              title="No Quality Check Performed yet"
              description="Run an AI quality audit for this course. Review the results to check course quality.
"
              imageWidth={220}
              minHeight="280px"
            />
            <Button
              variant="contained"
              onClick={handleRunCheck}
              disabled={runMutation.isPending}
              startIcon={<AssessmentOutlinedIcon />}
              sx={{
                mt: 2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "brand.main",
                px: 4,
                py: 1.25,
                boxShadow: "none",
                "&:hover": { bgcolor: "brand.dark", boxShadow: "none" }
              }}
            >
              {runMutation.isPending ? "Starting Audit..." : "Run AI quality"}
            </Button>
          </Box>
        </Card>
      ) : (
        <>
          {/* 1. Score Breakdown Section */}
          <ScoreOverview report={report} />

          {/* 2. Issues Filter and Listing card section */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              mb: 4,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              bgcolor: "background.paper"
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}>
              Issues
            </Typography>

            {/* Filter Toolbar */}
            <IssueFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {/* Issue list */}
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onAccept={handleAccept}
                  onDismiss={handleDismiss}
                  isAccepting={acceptMutation.isPending}
                  isDismissing={dismissMutation.isPending}
                />
              ))
            ) : (
              <Box sx={{ py: 6, textAlign: "center", bgcolor: "background.surface", borderRadius: "8px", border: "1px dashed", borderColor: "divider" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
                  No issues match the selected filters
                </Typography>
                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                  Try adjusting search keywords or clearing filter categories.
                </Typography>
              </Box>
            )}
          </Card>
        </>
      )}

      {/* 3. History List Section (at bottom of page) */}
      {!isChecking && reportsHistory && reportsHistory.length > 1 && (
        <ReportHistory
          reports={reportsHistory}
          currentReportId={reportId}
          onSelectReport={handleSelectReport}
        />
      )}

      {/* ── Feedback Drawer ── */}
      {submissionId && (
        <FeedbackDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          feedbacks={feedbacks}
          submissionInfo={submissionInfo}
          courseId={courseId}
          submissionHistory={submissionHistory}
          saveMutation={saveFeedbackMutation}
          deleteMutation={deleteFeedbackMutation}
          updateMutation={updateFeedbackMutation}
          requestChangesMutation={requestChangesMutation}
          approveMutation={approveMutation}
          onApproveClick={() => setApproveDialogOpen(true)}
        />
      )}

      {/* ── Approve confirm dialog ── */}
      <ConfirmDialog
        open={approveDialogOpen}
        title="Approve & Publish"
        message="Are you sure you want to approve this course and publish it to the marketplace? This action will notify the instructor."
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApprove}
      />
    </Box>
  );
}
