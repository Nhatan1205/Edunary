import { Box, Typography, Button, Chip, Alert, CircularProgress, Stack, Divider } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import useGetAttemptResult from "../../../../hooks/quiz-attempt-hooks/useGetAttemptResult";
import useGetAttemptHistory from "../../../../hooks/quiz-attempt-hooks/useGetAttemptHistory";

// ─── Single choice review row ─────────────────────────────────────────────────
function ChoiceRow({ choice }) {
  const { text, isCorrect, wasSelected } = choice;
  let bgcolor = "transparent";
  if (wasSelected && isCorrect) bgcolor = "success.light";
  else if (wasSelected && !isCorrect) bgcolor = "error.light";
  else if (!wasSelected && isCorrect) bgcolor = "action.selected";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.75,
        mb: 0.5,
        borderRadius: 1,
        bgcolor,
      }}
    >
      {wasSelected && isCorrect && <CheckCircleOutlineIcon color="success" fontSize="small" />}
      {wasSelected && !isCorrect && <CancelOutlinedIcon color="error" fontSize="small" />}
      {!wasSelected && isCorrect && <CheckCircleOutlineIcon color="disabled" fontSize="small" />}
      {!wasSelected && !isCorrect && <Box sx={{ width: 20 }} />}
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}

// ─── QuizResult ───────────────────────────────────────────────────────────────
function QuizResult({ attemptId, quizId, onRetry }) {
  const { data: result, isLoading, isError } = useGetAttemptResult(attemptId);
  const { data: history } = useGetAttemptHistory(quizId);

  if (isLoading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !result) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Could not load result. Please try again.</Alert>
      </Box>
    );
  }

  const passed = result.isPassed;
  const attemptsUsed = history?.length ?? 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
      {/* Score card */}
      <Box
        sx={{
          textAlign: "center",
          p: 4,
          mb: 3,
          borderRadius: 3,
          bgcolor: passed ? "success.light" : "error.light",
          border: "1px solid",
          borderColor: passed ? "success.main" : "error.main",
        }}
      >
        <Typography variant="h3" fontWeight={800} color={passed ? "success.dark" : "error.dark"}>
          {result.score}%
        </Typography>
        <Typography variant="h6" fontWeight={700} mt={0.5}>
          {passed ? "🎉 Passed!" : "😔 Not passed"}
        </Typography>
        <Typography color="text.secondary" mt={1}>
          {result.correctCount} / {result.totalQuestions} correct · Passing score: {result.passingScore}%
        </Typography>
        {attemptsUsed > 0 && (
          <Typography variant="caption" color="text.secondary">
            Attempt {attemptsUsed}
          </Typography>
        )}
      </Box>

      {/* Retry button */}
      {onRetry && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button variant="outlined" onClick={onRetry} sx={{ borderRadius: "999px", px: 3 }}>
            Try Again
          </Button>
        </Box>
      )}

      {/* Per-question review (only when ShowCorrectAnswers = true) */}
      {result.showCorrectAnswers && result.questions?.length > 0 && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" fontWeight={700} mb={2}>
            Review
          </Typography>
          {result.questions.map((q, idx) => (
            <Box
              key={q.questionId}
              sx={{
                mb: 3,
                p: 3,
                border: "1px solid",
                borderColor: q.isCorrect ? "success.main" : "error.main",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography fontWeight={600}>
                  {idx + 1}. {q.name}
                </Typography>
                <Chip
                  label={q.isCorrect ? "Correct" : "Incorrect"}
                  color={q.isCorrect ? "success" : "error"}
                  size="small"
                />
              </Stack>

              {q.choices.map((c) => (
                <ChoiceRow key={c.choiceId} choice={c} />
              ))}

              {q.explanation && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Explanation:</strong> {q.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default QuizResult;
