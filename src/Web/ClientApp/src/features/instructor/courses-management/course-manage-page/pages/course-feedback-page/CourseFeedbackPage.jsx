import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { Box, Typography, Chip, CircularProgress, Collapse, Divider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CourseFeedbackContent, { FeedbackCard } from "./CourseFeedbackContent";
import NoData from "../../../../../../components/NoData";
import emptyCourseFeedbackImg from "../../../../../../assets/images/empty-course-feedback.png";
import useGetCourseReviewStatus from "../../../../../../hooks/course-review-hooks/useGetCourseReviewStatus";
import useResolveReviewFeedback from "../../../../../../hooks/course-review-hooks/useResolveReviewFeedback";

// ── Status label helper ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  0: { label: "Pending Review", color: "warning" },    // ReviewSubmissionStatus.Pending
  1: { label: "Needs Changes", color: "error" },        // NeedsChanges
  2: { label: "Approved", color: "success" },           // Approved
};

// ── HistorySubmissionItem ─────────────────────────────────────────────────────

function HistorySubmissionItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const feedbacks = item.feedbacks ?? [];
  const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG[0];

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        onClick={() => setExpanded((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: expanded ? "4px 4px 0 0" : "4px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Submission #{item.submissionNumber}
          </Typography>
          <Chip
            label={statusCfg.label}
            color={statusCfg.color}
            size="small"
            sx={{ fontWeight: 600, height: 20, fontSize: "0.75rem" }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {item.reviewedAt
              ? new Date(item.reviewedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Awaiting review"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="caption" sx={{ mr: 1, color: "text.secondary" }}>
            {feedbacks.length} {feedbacks.length === 1 ? "feedback" : "feedbacks"}
          </Typography>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            border: "1px solid",
            borderTop: 0,
            borderColor: "divider",
            borderRadius: "0 0 4px 4px",
            bgcolor: "background.paper",
            opacity: 0.9,
          }}
        >
          {item.adminNote && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: "info.lighter",
                borderRadius: 1,
                borderLeft: "4px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: "info.darker", mb: 0.5 }}>
                Admin overall note:
              </Typography>
              <Typography variant="body2" sx={{ color: "info.darker" }}>
                {item.adminNote}
              </Typography>
            </Box>
          )}

          {feedbacks.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              No feedback items for this submission.
            </Typography>
          ) : (
            feedbacks.map((fb) => (
              <FeedbackCard key={fb.id} item={fb} readOnly={true} disableCollapse={true} />
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── CourseFeedbackPage ────────────────────────────────────────────────────────

export default function CourseFeedbackPage() {
  const { courseId } = useParams();

  const { data, isLoading } = useGetCourseReviewStatus(courseId);
  const resolveMutation = useResolveReviewFeedback(courseId);

  const submission = data?.latestSubmission ?? null;
  const feedbacks = submission?.feedbacks ?? [];
  const history = data?.submissionHistory ?? [];

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

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      {!submission ? (
        <NoData
          image={emptyCourseFeedbackImg}
          title="No feedback available yet"
          description="Your course hasn't been submitted for review or hasn't received feedback from the review team yet."
          imageWidth={220}
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

          {feedbacks.length > 0 || submission.adminNote ? (
            <CourseFeedbackContent
              submission={submission}
              feedbacks={feedbacks}
              onToggleResolved={handleToggleResolved}
            />
          ) : (
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                border: "1px dashed",
                borderColor: "divider",
                textAlign: "center",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {submission.status === 0
                  ? "This submission is currently awaiting review. Feedback will appear here once reviewed."
                  : "No feedback items for this submission."}
              </Typography>
            </Box>
          )}

          {history.length > 0 && (
            <Box sx={{ mt: 5, mb: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Previous Submissions ({history.length})
              </Typography>
              {history.map((item) => (
                <HistorySubmissionItem key={item.submissionNumber} item={item} />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
