import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Typography, Button, Radio, Checkbox, FormControlLabel,
  FormGroup, LinearProgress, Chip, Alert, CircularProgress, Stack,
} from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import useGetQuizByItemId from "../../../../hooks/quiz-hooks/useGetQuizByItemId";
import useStartQuizAttempt from "../../../../hooks/quiz-attempt-hooks/useStartQuizAttempt";
import useCacheQuizAnswer from "../../../../hooks/quiz-attempt-hooks/useCacheQuizAnswer";
import useGetCachedAnswers from "../../../../hooks/quiz-attempt-hooks/useGetCachedAnswers";
import useSubmitQuizAttempt from "../../../../hooks/quiz-attempt-hooks/useSubmitQuizAttempt";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import QuizResult from "./QuizResult";

// ─── Timer ────────────────────────────────────────────────────────────────────
function QuizTimer({ expiryTime, onExpire }) {
  const [remaining, setRemaining] = useState(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!expiryTime) return;
    let everHadTime = false;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiryTime) - Date.now()) / 1000));
      setRemaining(diff);
      if (diff > 0) everHadTime = true;
      if (diff === 0 && everHadTime) onExpireRef.current?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiryTime]);

  if (remaining === null) return null;
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  const urgent = remaining < 60;

  return (
    <Chip
      icon={<TimerOutlinedIcon />}
      label={`${m}:${s}`}
      color={urgent ? "error" : "default"}
      variant={urgent ? "filled" : "outlined"}
      sx={{ fontWeight: 700, fontSize: 15 }}
    />
  );
}

// ─── Quiz Playing Area ────────────────────────────────────────────────────────
function QuizPlayArea({ quiz, courseId }) {
  const quizId = quiz?.id;
  const [phase, setPhase] = useState("idle"); // "idle" | "playing" | "result"
  const [attemptData, setAttemptData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);

  const startMutation = useStartQuizAttempt();
  const cacheMutation = useCacheQuizAnswer();
  const submitMutation = useSubmitQuizAttempt();

  const { data: cachedData } = useGetCachedAnswers(
    phase === "playing" ? attemptData?.attemptId : null,
    phase === "playing" ? quizId : null
  );

  useEffect(() => {
    if (cachedData?.answers && attemptData?.isResumed) {
      const prefilled = {};
      Object.entries(cachedData.answers).forEach(([qId, choiceIds]) => {
        prefilled[parseInt(qId)] = choiceIds;
      });
      setAnswers(prefilled);
    }
  }, [cachedData, attemptData?.isResumed]);

  const handleStart = async () => {
    const res = await startMutation.mutateAsync({ quizId });
    if (res?.result) {
      setAttemptData(res.result);
      setAnswers({});
      setPhase("playing");
    }
  };

  const handleSelectAnswer = useCallback(
    (questionId, choiceId, type, checked) => {
      setAnswers((prev) => {
        let next;
        if (type === "SingleChoice" || type === "TrueFalse") {
          next = { ...prev, [questionId]: [choiceId] };
        } else {
          const current = prev[questionId] ?? [];
          next = {
            ...prev,
            [questionId]: checked
              ? [...current, choiceId]
              : current.filter((id) => id !== choiceId),
          };
        }
        cacheMutation.mutate({
          attemptId: attemptData.attemptId,
          quizId,
          questionId,
          selectedChoiceIds: next[questionId] ?? [],
        });
        return next;
      });
    },
    [attemptData, quizId, cacheMutation]
  );

  const handleSubmit = useCallback(async () => {
    const formattedAnswers = (attemptData?.questions ?? []).map((q) => ({
      questionId: q.id,
      selectedChoiceIds: answers[q.id] ?? [],
    }));
    const res = await submitMutation.mutateAsync({
      attemptId: attemptData.attemptId,
      answers: formattedAnswers,
    });
    if (res?.result) {
      setSubmittedAttemptId(attemptData.attemptId);
      setPhase("result");
    }
  }, [attemptData, answers, submitMutation]);

  const handleRetry = () => {
    setPhase("idle");
    setAttemptData(null);
    setAnswers({});
    setSubmittedAttemptId(null);
  };

  if (phase === "result") {
    return <QuizResult attemptId={submittedAttemptId} quizId={quizId} onRetry={handleRetry} />;
  }

  if (phase === "idle") {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          {quiz?.title}
        </Typography>
        {quiz?.description && (
          <Typography color="text.secondary" mb={1}>{quiz.description}</Typography>
        )}
        <Stack direction="row" justifyContent="center" gap={2} mb={3} flexWrap="wrap">
          {quiz?.timeLimitMinutes > 0 && (
            <Chip label={`${quiz.timeLimitMinutes} min limit`} variant="outlined" />
          )}
          {quiz?.passingScore > 0 && (
            <Chip label={`Pass: ${quiz.passingScore}%`} variant="outlined" />
          )}
          {quiz?.maxAttempts > 0 && (
            <Chip label={`Max ${quiz.maxAttempts} attempts`} variant="outlined" />
          )}
          <Chip label={`${quiz?.questions?.length ?? 0} questions`} variant="outlined" />
        </Stack>
        <Button
          variant="contained"
          size="large"
          onClick={handleStart}
          disabled={startMutation.isPending}
          sx={{ borderRadius: "999px", px: 4 }}
        >
          {startMutation.isPending ? <CircularProgress size={20} /> : "Start Quiz"}
        </Button>
        {startMutation.data?.message && !startMutation.data?.result && (
          <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
            {startMutation.data.message}
          </Alert>
        )}
      </Box>
    );
  }

  // Playing
  const questions = attemptData?.questions ?? [];
  const answeredCount = Object.keys(answers).filter((qId) => (answers[qId]?.length ?? 0) > 0).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>{attemptData?.quizTitle}</Typography>
        <QuizTimer expiryTime={attemptData?.expiryTime} onExpire={handleSubmit} />
      </Stack>

      {attemptData?.isResumed && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Resuming previous session — your answers have been restored.
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {answeredCount} / {questions.length} answered
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 4, height: 6, mt: 0.5 }} />
      </Box>

      {questions.map((q, idx) => {
        const selected = answers[q.id] ?? [];
        const isMultiple = q.type === "MultipleChoice";

        return (
          <Box
            key={q.id}
            sx={{
              mb: 3, p: 3,
              border: "1px solid",
              borderColor: selected.length > 0 ? "brand.main" : "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography fontWeight={600} mb={1.5}>
              {idx + 1}. {q.name}
              {isMultiple && <Chip label="Multiple answers" size="small" sx={{ ml: 1 }} />}
            </Typography>
            <FormGroup>
              {q.choices.map((c) => {
                const isSelected = selected.includes(c.id);
                return (
                  <FormControlLabel
                    key={c.id}
                    control={
                      isMultiple ? (
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectAnswer(q.id, c.id, q.type, e.target.checked)}
                        />
                      ) : (
                        <Radio
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(q.id, c.id, q.type, true)}
                        />
                      )
                    }
                    label={c.text}
                    sx={{
                      mb: 0.5, px: 1.5, py: 0.5, borderRadius: 1,
                      bgcolor: isSelected ? "action.selected" : "transparent",
                    }}
                  />
                );
              })}
            </FormGroup>
          </Box>
        );
      })}

      <Box sx={{ textAlign: "right", mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          sx={{ borderRadius: "999px", px: 4 }}
        >
          {submitMutation.isPending ? <CircularProgress size={20} /> : "Submit Quiz"}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Page wrapper (route entry) ───────────────────────────────────────────────
function QuizPlayer() {
  const { courseId, contentId } = useParams();
  const { data: quiz, isLoading, isError } = useGetQuizByItemId(
    courseId ? parseInt(courseId) : null,
    contentId
  );

  return (
    <Box>
      {/* Quiz area */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        {isLoading && (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Failed to load quiz.</Alert>
          </Box>
        )}
        {quiz && (
          <QuizPlayArea quiz={quiz} courseId={parseInt(courseId)} />
        )}
        {!isLoading && !isError && !quiz && (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography color="text.secondary">No quiz found for this item.</Typography>
          </Box>
        )}
      </Box>

      {/* Tabs area (same as video page) */}
      <CourseLearnTab courseId={parseInt(courseId)} contentId={contentId} />
    </Box>
  );
}

export default QuizPlayer;