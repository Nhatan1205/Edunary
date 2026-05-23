import { useCallback } from "react";
import { useParams } from "react-router";
import { Box, Typography, Chip, CircularProgress } from "@mui/material";
import CourseFeedbackContent from "./CourseFeedbackContent";
import NoData from "../../../../../../components/NoData";
import useGetCourseReviewStatus from "../../../../../../hooks/course-review-hooks/useGetCourseReviewStatus";
import useResolveReviewFeedback from "../../../../../../hooks/course-review-hooks/useResolveReviewFeedback";

// ── Status label helper ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  0: { label: "Pending Review", color: "warning" },    // ReviewSubmissionStatus.Pending
  1: { label: "Needs Changes", color: "error" },        // NeedsChanges
  2: { label: "Approved", color: "success" },           // Approved
};

// ── CourseFeedbackPage ────────────────────────────────────────────────────────

export default function CourseFeedbackPage() {
  const { courseId } = useParams();

  const { data, isLoading } = useGetCourseReviewStatus(courseId);
  const resolveMutation = useResolveReviewFeedback(courseId);

  const submission = data?.latestSubmission ?? null;
  const feedbacks = submission?.feedbacks ?? [];

  const statusCfg = submission ? (STATUS_CONFIG[submission.status] ?? STATUS_CONFIG[0]) : null;

  const handleToggleResolved = useCallback(
    (feedbackId, currentIsResolved) => {
      resolveMutation.mutate({ feedbackId, isResolved: !currentIsResolved });
    },
    [resolveMutation],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const hasNoFeedback = !submission || feedbacks.length === 0;

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      {hasNoFeedback ? (
        <NoData
          title="No feedback available yet"
          description="Your course hasn't been submitted for review or hasn't received feedback from the review team yet."
          minHeight="320px"
        />
      ) : (
        <>
          {/* Submission status & info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {statusCfg && (
              <Chip
                label={statusCfg.label}
                color={statusCfg.color}
                size="small"
                sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.8rem" }}
              />
            )}
            <Typography variant="caption" sx={{ color: "text.tertiary" }}>
              Submission #{submission.submissionNumber} ·{" "}
              {submission.reviewedAt
                ? `Reviewed on ${new Date(submission.reviewedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                : "Awaiting review"}
            </Typography>
          </Box>

          <CourseFeedbackContent
            submission={submission}
            feedbacks={feedbacks}
            onToggleResolved={handleToggleResolved}
          />
        </>
      )}
    </Box>
  );
}
