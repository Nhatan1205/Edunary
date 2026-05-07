import { useState } from "react";
import {
  Box, Typography, Button, Chip, Alert, CircularProgress, Stack, Divider, LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import ReplayIcon from "@mui/icons-material/Replay";
import useGetAttemptResult from "../../../../hooks/quiz-attempt-hooks/useGetAttemptResult";
import useGetAttemptHistory from "../../../../hooks/quiz-attempt-hooks/useGetAttemptHistory";

// ─── Review choice row ────────────────────────────────────────────────────────
function ReviewChoiceRow({ choice }) {
  const { text, isCorrect, wasSelected } = choice;
  let borderColor = "divider";
  let bgcolor = "background.paper";
  let icon = null;

  if (wasSelected && isCorrect) {
    borderColor = "success.main"; bgcolor = "rgba(0,167,111,0.07)";
    icon = <CheckCircleIcon color="success" fontSize="small" />;
  } else if (wasSelected && !isCorrect) {
    borderColor = "error.main"; bgcolor = "rgba(255,86,48,0.07)";
    icon = <CancelIcon color="error" fontSize="small" />;
  } else if (!wasSelected && isCorrect) {
    borderColor = "success.light"; bgcolor = "rgba(0,167,111,0.03)";
    icon = <CheckCircleOutlineIcon color="success" fontSize="small" />;
  }

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 2, py: 1.25, borderRadius: 2, mb: 0.75,
      border: "1.5px solid", borderColor, bgcolor,
    }}>
      <Box sx={{ width: 20, flexShrink: 0 }}>{icon}</Box>
      <Typography variant="body2" fontWeight={wasSelected ? 600 : 400}>{text}</Typography>
    </Box>
  );
}

// ─── QuizResult ───────────────────────────────────────────────────────────────
function QuizResult({ attemptId, quizId, onRetry, onDone }) {
  const { data: result, isLoading, isError } = useGetAttemptResult(attemptId);
  const { data: history } = useGetAttemptHistory(quizId);
  const [reviewIndex, setReviewIndex] = useState(0);

  if (isLoading) {
    return (
      <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !result) {
    return (
      <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Alert severity="error">Could not load result. Please try again.</Alert>
      </Box>
    );
  }

  const passed = result.isPassed;
  const attemptsUsed = history?.length ?? 0;
  const hasReview = result.showCorrectAnswers && result.questions?.length > 0;
  const reviewQ = hasReview ? result.questions[reviewIndex] : null;
  const totalReview = result.questions?.length ?? 0;

  return (
    <Box sx={{
      width: "100%", height: "500px",
      bgcolor: "background.paper",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Score header */}
      <Box sx={{
        px: 4, py: 3, flexShrink: 0,
        background: passed
          ? "linear-gradient(135deg, rgba(0,167,111,0.10) 0%, rgba(0,167,111,0.02) 100%)"
          : "linear-gradient(135deg, rgba(255,86,48,0.10) 0%, rgba(255,86,48,0.02) 100%)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}>
        <Stack direction="row" alignItems="center" gap={3.5}>

          {/* Score ring */}
          <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={96}
              thickness={3}
              sx={{ color: passed ? "rgba(0,167,111,0.12)" : "rgba(255,86,48,0.12)", position: "absolute", left: 0 }}
            />
            <CircularProgress
              variant="determinate"
              value={result.score}
              size={96}
              thickness={3}
              sx={{ color: passed ? "success.main" : "error.main" }}
            />
            <Box sx={{
              top: 0, left: 0, bottom: 0, right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <Typography variant="h5" fontWeight={800} lineHeight={1}
                color={passed ? "success.dark" : "error.dark"}>
                {result.score}%
              </Typography>
            </Box>
          </Box>

          {/* Status + stats */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Typography variant="h6" fontWeight={800}>
                {passed ? "🎉 Passed!" : "Not Passed"}
              </Typography>
              <Chip
                label={passed ? "Passed" : "Failed"}
                color={passed ? "success" : "error"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            {/* Stat pills */}
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip
                label={`${result.correctCount}/${result.totalQuestions} correct`}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600, borderColor: passed ? "success.main" : "error.main", color: passed ? "success.dark" : "error.dark" }}
              />
              <Chip
                label={`Pass: ${result.passingScore}%`}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {attemptsUsed > 0 && (
                <Chip
                  label={`Attempt #${attemptsUsed}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>

          {/* Retry */}
          {onRetry && (
            <Button
              variant={passed ? "outlined" : "contained"}
              onClick={onRetry}
              startIcon={<ReplayIcon fontSize="small" />}
              sx={{ borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 700, flexShrink: 0 }}
            >
              Try Again
            </Button>
          )}
        </Stack>
      </Box>

      {/* Review section */}
      {hasReview ? (
        <>
          {/* Review nav header */}
          <Box sx={{ px: 3, py: 1.5, flexShrink: 0, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={0.8}>
                REVIEW ANSWERS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {reviewIndex + 1} / {totalReview}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={((reviewIndex + 1) / totalReview) * 100}
              sx={{ height: 4, borderRadius: 2, "& .MuiLinearProgress-bar": { bgcolor: "brand.main" } }}
            />
          </Box>

          {/* Review question body */}
          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 3, sm: 6 }, py: { xs: 2, sm: 4 } }}>
            {reviewQ && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography fontWeight={700} fontSize={15} lineHeight={1.6} sx={{ flex: 1, pr: 1 }}>
                    {reviewIndex + 1}. {reviewQ.name}
                  </Typography>
                  <Chip
                    label={reviewQ.isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    color={reviewQ.isCorrect ? "success" : "error"}
                    size="small"
                    sx={{ flexShrink: 0 }}
                  />
                </Stack>

                {reviewQ.choices.map((c) => (
                  <ReviewChoiceRow key={c.choiceId} choice={c} />
                ))}

                {reviewQ.explanation && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Explanation:</strong> {reviewQ.explanation}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>

          <Divider />

          {/* Review footer nav */}
          <Box sx={{ px: 3, py: 1.75, flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "14px !important" }} />}
                onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                disabled={reviewIndex === 0}
                sx={{ borderRadius: "999px", px: 2.5, textTransform: "none", minWidth: 110 }}
              >
                Previous
              </Button>

              {totalReview <= 15 && (
                <Stack direction="row" gap={0.75} alignItems="center">
                  {result.questions.map((rq, i) => (
                    <Box
                      key={i}
                      onClick={() => setReviewIndex(i)}
                      sx={{
                        width: i === reviewIndex ? 20 : 8, height: 8, borderRadius: "999px",
                        bgcolor: i === reviewIndex
                          ? "brand.main"
                          : (result.questions[i]?.isCorrect ? "rgba(0,167,111,0.4)" : "rgba(255,86,48,0.4)"),
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    />
                  ))}
                </Stack>
              )}

              <Button
                variant="contained"
                endIcon={reviewIndex < totalReview - 1 ? <ArrowForwardIosIcon sx={{ fontSize: "14px !important" }} /> : null}
                onClick={() => {
                  if (reviewIndex < totalReview - 1) {
                    setReviewIndex((i) => i + 1);
                  } else {
                    if (onDone) onDone();
                  }
                }}
                sx={{ borderRadius: "999px", px: 2.5, textTransform: "none", minWidth: 110 }}
              >
                {reviewIndex === totalReview - 1 ? "Done" : "Next"}
              </Button>
            </Stack>
          </Box>
        </>
      ) : (
        /* No review — centered empty state */
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography color="text.secondary" variant="body2">
            {passed ? "Great job! Keep it up." : "Review is not available for this quiz."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default QuizResult;
