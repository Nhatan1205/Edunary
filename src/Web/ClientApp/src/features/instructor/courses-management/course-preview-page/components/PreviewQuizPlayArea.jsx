import React, { useState, useEffect, useCallback, useRef } from "react";
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
import PreviewQuizResult from "./PreviewQuizResult";

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

// ─── Preview Quiz Play Area ───────────────────────────────────────────────────
export default function PreviewQuizPlayArea({ quiz, courseId }) {
  const [phase, setPhase] = useState("idle");
  const [attemptData, setAttemptData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockResult, setMockResult] = useState(null);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      let finalQuestions = [...quiz.questions];

      // Shuffle questions and their choices if randomizeQuestions is true
      if (quiz.randomizeQuestions) {
        finalQuestions = finalQuestions.sort(() => Math.random() - 0.5).map(q => {
          return {
            ...q,
            choices: [...q.choices].sort(() => Math.random() - 0.5)
          };
        });
      }

      setAttemptData({
        questions: finalQuestions,
        expiryTime: quiz.timeLimitMinutes > 0 ? new Date(Date.now() + quiz.timeLimitMinutes * 60000).toISOString() : null,
      });
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPhase("playing");
      setIsStarting(false);
    }, 400); 
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
        return next;
      });
    },
    []
  );

  const handleSubmitQuiz = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Calculate mock result
      let correctCount = 0;
      const calculatedQuestions = (attemptData?.questions || quiz.questions).map(q => {
        const selectedIds = answers[q.id] || [];
        const correctChoices = q.choices.filter(c => c.isCorrect).map(c => c.id);
        
        let isCorrect = false;
        if (q.type === "MultipleChoice") {
          isCorrect = selectedIds.length === correctChoices.length && 
                      selectedIds.every(id => correctChoices.includes(id));
        } else {
          isCorrect = selectedIds.length === 1 && correctChoices.includes(selectedIds[0]);
        }

        if (isCorrect) correctCount++;

        return {
          id: q.id,
          name: q.name,
          type: q.type,
          explanation: q.explanation,
          isCorrect: isCorrect,
          choices: q.choices.map(c => ({
            id: c.id,
            text: c.text,
            isCorrect: c.isCorrect,
            isSelected: selectedIds.includes(c.id)
          }))
        };
      });

      const totalQuestions = quiz.questions.length;
      const scorePercentage = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
      const passed = scorePercentage >= quiz.passingScore;

      setMockResult({
        totalQuestions,
        correctAnswers: correctCount,
        scorePercentage,
        passed,
        passingScore: quiz.passingScore,
        showCorrectAnswers: quiz.showCorrectAnswers,
        questions: calculatedQuestions
      });

      setPhase("result");
      setIsSubmitting(false);
    }, 500);
  }, [quiz, answers]);

  const handleRetry = () => {
    setPhase("idle");
    setAttemptData(null);
    setAnswers({});
    setMockResult(null);
    setCurrentQuestionIndex(0);
  };

  if (phase === "result") {
    return <PreviewQuizResult result={mockResult} onRetry={handleRetry} onDone={handleRetry} />;
  }

  if (phase === "idle") {
    return (
      <Box sx={{
        width: "100%", height: "500px",
        bgcolor: "background.default",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        p: 4, position: "relative", overflow: "hidden"
      }}>
        {/* Background blobs */}
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,167,111,0.08) 0%, rgba(0,167,111,0) 70%)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,167,111,0.06) 0%, rgba(0,167,111,0) 70%)" }} />

        <Box sx={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 500 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, boxShadow: "0 8px 24px rgba(0,167,111,0.12)", transform: "rotate(-5deg)" }}>
            <QuizOutlinedIcon sx={{ fontSize: 36, color: "brand.main", transform: "rotate(5deg)" }} />
          </Box>

          <Typography variant="h4" fontWeight={800} mb={1.5} textAlign="center">
            {quiz?.title} <Chip label="PREVIEW" size="small" color="warning" sx={{ ml: 1, fontWeight: 700 }} />
          </Typography>
          {quiz?.description && (
            <Typography color="text.secondary" mb={4} textAlign="center" sx={{ fontSize: "1rem", lineHeight: 1.6 }}>
              {quiz.description}
            </Typography>
          )}

          <Stack direction="row" justifyContent="center" gap={1.5} mb={5} width="100%">
            {quiz?.timeLimitMinutes > 0 && <StatBox icon={<TimerOutlinedIcon />} label="Time Limit" value={`${quiz.timeLimitMinutes}m`} />}
            {quiz?.passingScore > 0 && <StatBox icon={<FactCheckOutlinedIcon />} label="Pass Score" value={`${quiz.passingScore}%`} />}
            {quiz?.maxAttempts > 0 && <StatBox icon={<ReplayOutlinedIcon />} label="Attempts" value={quiz.maxAttempts} />}
            <StatBox icon={<FormatListNumberedOutlinedIcon />} label="Questions" value={quiz?.questions?.length ?? 0} />
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={handleStart}
            disabled={isStarting}
            sx={{ 
              borderRadius: "999px", px: 6, py: 1.5, fontWeight: 700, fontSize: 16,
              boxShadow: "0 8px 16px rgba(0,167,111,0.24)", transition: "all 0.2s",
              "&:hover": { boxShadow: "0 12px 20px rgba(0,167,111,0.32)", transform: "translateY(-2px)" }
            }}
          >
            {isStarting ? <CircularProgress size={24} color="inherit" /> : "Start Preview"}
          </Button>
        </Box>
      </Box>
    );
  }

  // ── Playing ──
  const qList = attemptData?.questions ?? [];
  const q = qList[currentQuestionIndex];
  const totalQuestions = qList.length;
  const isMultiple = q?.type === "MultipleChoice";
  const selected = answers[q?.id] ?? [];

  return (
    <Box sx={{
      width: "100%", height: "500px",
      bgcolor: "background.paper",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5, flexShrink: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: "60%" }}>
            {quiz?.title} <Chip label="PREVIEW" size="small" color="warning" sx={{ ml: 1, fontWeight: 700, fontSize: 10 }} />
          </Typography>
          <QuizTimer expiryTime={attemptData?.expiryTime} onExpire={handleSubmitQuiz} />
        </Stack>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={totalQuestions === 0 ? 0 : (Object.keys(answers).length / totalQuestions) * 100}
            sx={{ flex: 1, height: 6, borderRadius: "999px", bgcolor: "divider" }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Question area */}
      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 3, sm: 6 }, py: { xs: 2, sm: 4 } }}>
        {q && (
          <>
            <Typography fontWeight={700} mb={2} fontSize={15} lineHeight={1.6}>
              {currentQuestionIndex + 1}. {q.name}
              {isMultiple && <Chip label="Select all that apply" size="small" sx={{ ml: 1, fontSize: 11 }} />}
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
                    onSelect={() => handleSelectAnswer(q.id, c.id, q.type, !isSel)}
                  />
                );
              })}
            </Stack>
          </>
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "background.default" }}>
        <Button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((i) => i - 1)}
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: "14px !important" }} />}
          sx={{ borderRadius: "999px", px: 2.5, textTransform: "none" }}
        >
          Previous
        </Button>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            sx={{ borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 600, boxShadow: 2 }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Submit Quiz"}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestionIndex((i) => i + 1)}
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: "14px !important" }} />}
            sx={{ borderRadius: "999px", px: 2.5, textTransform: "none" }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
