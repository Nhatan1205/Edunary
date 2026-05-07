import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Button, Radio, Checkbox,
  LinearProgress, Chip, Alert, CircularProgress, Stack, Divider,
} from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import useStartQuizAttempt from "../../../../hooks/quiz-attempt-hooks/useStartQuizAttempt";
import useCacheQuizAnswer from "../../../../hooks/quiz-attempt-hooks/useCacheQuizAnswer";
import useGetCachedAnswers from "../../../../hooks/quiz-attempt-hooks/useGetCachedAnswers";
import useSubmitQuizAttempt from "../../../../hooks/quiz-attempt-hooks/useSubmitQuizAttempt";
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
      icon={<TimerOutlinedIcon fontSize="small" />}
      label={`${m}:${s}`}
      color={urgent ? "error" : "default"}
      variant={urgent ? "filled" : "outlined"}
      size="small"
      sx={{ fontWeight: 700, fontSize: 13 }}
    />
  );
}

// ─── Choice Card ──────────────────────────────────────────────────────────────
function ChoiceCard({ choice, isSelected, isMultiple, onSelect }) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.5, borderRadius: 2,
        border: "1.5px solid",
        borderColor: isSelected ? "brand.main" : "divider",
        bgcolor: isSelected ? "rgba(0,167,111,0.06)" : "background.paper",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": { borderColor: "brand.main", bgcolor: "rgba(0,167,111,0.04)" },
      }}
    >
      {isMultiple ? (
        <Checkbox
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={onSelect}
          size="small"
          sx={{ p: 0, color: isSelected ? "brand.main" : undefined }}
        />
      ) : (
        <Radio
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={onSelect}
          size="small"
          sx={{ p: 0, color: isSelected ? "brand.main" : undefined }}
        />
      )}
      <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
        {choice.text}
      </Typography>
    </Box>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({ icon, label, value }) {
  return (
    <Box sx={{
      display: "flex", flexDirection: "column", alignItems: "center",
      p: 2, borderRadius: 3, minWidth: 100, flex: 1,
      border: "1px solid", borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    }}>
      <Box sx={{ color: "brand.main", mb: 1, display: "flex" }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800} lineHeight={1} mb={0.5}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>{label}</Typography>
    </Box>
  );
}

// ─── Quiz Play Area ───────────────────────────────────────────────────────────
function QuizPlayArea({ quiz, courseId, onDone }) {
  const quizId = quiz?.id;
  const [phase, setPhase] = useState("idle");
  const [attemptData, setAttemptData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
      setCurrentQuestionIndex(0);
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
    setCurrentQuestionIndex(0);
  };

  // ── Result ──
  if (phase === "result") {
    return <QuizResult attemptId={submittedAttemptId} quizId={quizId} onRetry={handleRetry} onDone={onDone} />;
  }

  // ── Idle ──
  if (phase === "idle") {
    return (
      <Box sx={{
        width: "100%", height: "500px",
        bgcolor: "background.default",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        p: 4, position: "relative", overflow: "hidden"
      }}>
        {/* Background decorative blobs */}
        <Box sx={{
          position: "absolute", top: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,167,111,0.08) 0%, rgba(0,167,111,0) 70%)",
        }} />
        <Box sx={{
          position: "absolute", bottom: -80, left: -80,
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,167,111,0.06) 0%, rgba(0,167,111,0) 70%)",
        }} />

        <Box sx={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 500 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 3, boxShadow: "0 8px 24px rgba(0,167,111,0.12)",
            transform: "rotate(-5deg)"
          }}>
            <QuizOutlinedIcon sx={{ fontSize: 36, color: "brand.main", transform: "rotate(5deg)" }} />
          </Box>

          <Typography variant="h4" fontWeight={800} mb={1.5} textAlign="center">
            {quiz?.title}
          </Typography>
          {quiz?.description && (
            <Typography color="text.secondary" mb={4} textAlign="center" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
              {quiz.description}
            </Typography>
          )}

          <Stack direction="row" justifyContent="center" gap={1.5} mb={5} width="100%">
            {quiz?.timeLimitMinutes > 0 && (
              <StatBox icon={<TimerOutlinedIcon />} label="Time Limit" value={`${quiz.timeLimitMinutes}m`} />
            )}
            {quiz?.passingScore > 0 && (
              <StatBox icon={<FactCheckOutlinedIcon />} label="Pass Score" value={`${quiz.passingScore}%`} />
            )}
            {quiz?.maxAttempts > 0 && (
              <StatBox icon={<ReplayOutlinedIcon />} label="Attempts" value={quiz.maxAttempts} />
            )}
            <StatBox icon={<FormatListNumberedOutlinedIcon />} label="Questions" value={quiz?.questions?.length ?? 0} />
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={handleStart}
            disabled={startMutation.isPending}
            sx={{ 
              borderRadius: "999px", px: 6, py: 1.5, fontWeight: 700, fontSize: 16,
              boxShadow: "0 8px 16px rgba(0,167,111,0.24)",
              transition: "all 0.2s",
              "&:hover": { boxShadow: "0 12px 20px rgba(0,167,111,0.32)", transform: "translateY(-2px)" }
            }}
          >
            {startMutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Start Quiz Now"}
          </Button>

          {startMutation.data?.message && !startMutation.data?.result && (
            <Alert severity="warning" sx={{ mt: 3, width: "100%" }}>
              {startMutation.data.message}
            </Alert>
          )}
        </Box>
      </Box>
    );
  }

  // ── Playing ──
  const questions = attemptData?.questions ?? [];
  const totalQuestions = questions.length;
  const q = questions[currentQuestionIndex];
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === totalQuestions - 1;
  const selected = answers[q?.id] ?? [];
  const isMultiple = q?.type === "MultipleChoice";
  const answeredCount = Object.keys(answers).filter((qId) => (answers[qId]?.length ?? 0) > 0).length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <Box sx={{
      width: "100%", height: "500px",
      bgcolor: "background.paper",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700} sx={{
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%"
          }}>
            {attemptData?.quizTitle}
          </Typography>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="caption" color="text.secondary">
              {answeredCount}/{totalQuestions} answered
            </Typography>
            <QuizTimer expiryTime={attemptData?.expiryTime} onExpire={handleSubmit} />
          </Stack>
        </Stack>
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": { bgcolor: "brand.main" }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Resumed banner */}
      {attemptData?.isResumed && currentQuestionIndex === 0 && (
        <Alert severity="info" icon={false} sx={{ mx: 2, mt: 1, py: 0.5, fontSize: 13 }}>
          Resuming previous session — your answers have been restored.
        </Alert>
      )}

      {/* Question area */}
      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 3, sm: 6 }, py: { xs: 2, sm: 4 } }}>
        {q && (
          <>
            <Typography fontWeight={700} mb={2} fontSize={15} lineHeight={1.6}>
              {currentQuestionIndex + 1}. {q.name}
              {isMultiple && (
                <Chip label="Select all that apply" size="small" sx={{ ml: 1, fontSize: 11 }} />
              )}
            </Typography>
            <Stack gap={1}>
              {q.choices.map((c) => {
                const isSel = selected.includes(c.id);
                return (
                  <ChoiceCard
                    key={c.id}
                    choice={c}
                    isSelected={isSel}
                    isMultiple={isMultiple}
                    onSelect={() => handleSelectAnswer(q.id, c.id, q.type, isMultiple ? !isSel : true)}
                  />
                );
              })}
            </Stack>
          </>
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 3, py: 1.75, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "14px !important" }} />}
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            sx={{ borderRadius: "999px", px: 2.5, textTransform: "none", minWidth: 110 }}
          >
            Previous
          </Button>

          {/* Dot indicators (max 15) */}
          {totalQuestions <= 15 && (
            <Stack direction="row" gap={0.75} alignItems="center">
              {questions.map((qItem, i) => (
                <Box
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  sx={{
                    width: i === currentQuestionIndex ? 20 : 8,
                    height: 8, borderRadius: "999px",
                    bgcolor: i === currentQuestionIndex
                      ? "brand.main"
                      : (answers[qItem?.id]?.length > 0 ? "rgba(0,167,111,0.35)" : "action.disabled"),
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Stack>
          )}

          {isLast ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              sx={{ borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 700, minWidth: 110 }}
            >
              {submitMutation.isPending ? <CircularProgress size={18} /> : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              sx={{ borderRadius: "999px", px: 2.5, textTransform: "none", minWidth: 110 }}
            >
              Next
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default QuizPlayArea;
