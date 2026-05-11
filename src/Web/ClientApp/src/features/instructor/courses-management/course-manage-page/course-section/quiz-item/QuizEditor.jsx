import { useState, useEffect, useRef } from "react";
import {
  Box, Button, Typography, TextField, Switch, FormControlLabel,
  Divider, Stack, Alert, CircularProgress, Select, MenuItem, FormControl, InputLabel,
  Badge,
} from "@mui/material";
import { Add as AddIcon, Check as CheckIcon, AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import useCreateQuiz from "../../../../../../hooks/quiz-hooks/useCreateQuiz";
import useUpdateQuiz from "../../../../../../hooks/quiz-hooks/useUpdateQuiz";
import useUpdateQuizQuestions from "../../../../../../hooks/quiz-hooks/useUpdateQuizQuestions";
import useGetQuizByItemId from "../../../../../../hooks/quiz-hooks/useGetQuizByItemId";
import useQuizGenerateProgress from "../../../../../../hooks/quiz-hooks/useQuizGenerateProgress";
import QuestionEditor from "./QuestionEditor";
import AIQuizGeneratorDialog from "./AIQuizGeneratorDialog";

const QUESTION_TYPE_MAP = {
  SingleChoice: 0,
  MultipleChoice: 1,
  TrueFalse: 2,
};

const REVERSE_QUESTION_TYPE_MAP = {
  0: "SingleChoice",
  1: "MultipleChoice",
  2: "TrueFalse",
};

function QuizEditor({ item, onUpdate, courseId, sections = [] }) {
  const { data: existingQuiz } = useGetQuizByItemId(courseId, item.itemId);
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const updateQuestions = useUpdateQuizQuestions();

  const initializedRef = useRef(false);
  const [description, setDescription] = useState("");
  const [relatedItemId, setRelatedItemId] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (existingQuiz && !initializedRef.current) {
      initializedRef.current = true;
      setDescription(existingQuiz.description ?? "");
      setRelatedItemId(existingQuiz.relatedItemId ?? "");
      setTimeLimitMinutes(existingQuiz.timeLimitMinutes ?? 0);
      setPassingScore(existingQuiz.passingScore ?? 70);
      setMaxAttempts(existingQuiz.maxAttempts ?? 0);
      setShowCorrectAnswers(existingQuiz.showCorrectAnswers ?? true);
      setRandomizeQuestions(existingQuiz.randomizeQuestions ?? false);
      setQuestions(
        existingQuiz.questions?.map((q) => ({
          id: q.id,
          name: q.name,
          type: typeof q.type === "number" ? REVERSE_QUESTION_TYPE_MAP[q.type] : (q.type ?? "SingleChoice"),
          explanation: q.explanation ?? "",
          sortOrder: q.sortOrder,
          choices: q.choices.map((c) => ({
            id: c.id,
            text: c.text,
            isCorrect: c.isCorrect,
            sortOrder: c.sortOrder,
          })),
        })) ?? []
      );
    }
  }, [existingQuiz]);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  // ── AI Generation state (lifted here so SignalR survives dialog close) ────────
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pendingResult, setPendingResult] = useState(null); // results waiting when dialog was closed

  const progress = useQuizGenerateProgress(generating);

  // When generation completes/errors while dialog is closed → handle here
  useEffect(() => {
    if (aiDialogOpen) return; // dialog is open, it handles its own state
    if (progress.percent === 100 && progress.questions) {
      setPendingResult(progress.questions);
      setGenerating(false);
    } else if (progress.percent === -1) {
      // Error arrived while dialog was closed — just stop generating
      setGenerating(false);
    }
  }, [progress, aiDialogOpen]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        name: "",
        type: "SingleChoice",
        explanation: "",
        sortOrder: questions.length,
        choices: [
          { text: "Choice 1", isCorrect: true, sortOrder: 0 },
          { text: "Choice 2", isCorrect: false, sortOrder: 1 },
        ],
      },
    ]);
  };

  // Map AI-generated questions (from AI Center) to QuizEditor local state format
  const handleApplyGenerated = (generatedQuestions, mode) => {
    const mapped = generatedQuestions.map((q, qi) => ({
      name: q.name,
      type: q.type,
      explanation: q.explanation ?? "",
      sortOrder: qi,
      choices: (q.choices || []).map((c, ci) => ({
        text: c.text,
        isCorrect: c.is_correct ?? c.isCorrect ?? false,
        sortOrder: ci,
      })),
    }));
    setQuestions(mode === "append" ? [...questions, ...mapped] : mapped);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      let quizId = existingQuiz?.id;

      const settingsPayload = {
        courseId,
        itemId: item.itemId,
        title: item.title,
        description: description,
        relatedItemId: relatedItemId || null,
        timeLimitMinutes: parseInt(timeLimitMinutes) || 0,
        passingScore: parseFloat(passingScore) || 0,
        maxAttempts: parseInt(maxAttempts) || 0,
        showCorrectAnswers,
        randomizeQuestions,
      };

      if (!quizId) {
        const res = await createQuiz.mutateAsync(settingsPayload);
        quizId = res?.result;
        onUpdate(item.itemId, { quizId: quizId, description: description });
      } else {
        await updateQuiz.mutateAsync({ quizId, ...settingsPayload });
        onUpdate(item.itemId, { quizId: quizId, description: description });
      }

      await updateQuestions.mutateAsync({
        quizId,
        questions: questions.map((q, qi) => ({
          id: q.id,
          name: q.name,
          type: QUESTION_TYPE_MAP[q.type] ?? 0,
          explanation: q.explanation,
          sortOrder: qi,
          choices: q.choices.map((c, ci) => ({
            id: c.id,
            text: c.text,
            isCorrect: c.isCorrect,
            sortOrder: ci,
          })),
        })),
      });

      setSavedMsg("Quiz saved — snapshot is being generated in the background.");
    } catch (e) {
      let errorText = e.message;
      if (e.response) {
        try {
          const problem = JSON.parse(e.response);
          if (problem.errors) {
            errorText = Object.values(problem.errors).flat().join(" | ");
          } else if (problem.detail) {
            errorText = problem.detail;
          } else if (problem.title) {
            errorText = problem.title;
          }
        } catch (err) {
          // Ignore JSON parse error
        }
      }
      setSavedMsg(`Error: ${errorText}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{
      pt: 2, pb: 1,
      "& .MuiOutlinedInput-root": {
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
      },
      "& .MuiInputLabel-root.Mui-focused": { color: "brand.main" }
    }}>
      {/* Settings */}
      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
        Quiz Settings
      </Typography>

      <TextField
        size="small"
        fullWidth
        label="Description / Instructions"
        multiline
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Related Item Selector */}
      {sections.flatMap(s => s.items).filter(i => i.itemId !== item.itemId && i.type !== "quiz").length > 0 && (
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel id="related-item-label">Related Lecture Item (optional)</InputLabel>
          <Select
            labelId="related-item-label"
            value={relatedItemId}
            label="Related Lecture Item (optional)"
            onChange={(e) => setRelatedItemId(e.target.value)}
          >
            <MenuItem value="">-- None --</MenuItem>
            {sections.flatMap(s =>
              s.items
                .filter(i => i.itemId !== item.itemId && i.type !== "quiz")
                .map(i => (
                  <MenuItem key={i.itemId} value={i.itemId}>
                    {i.title || i.itemId}
                  </MenuItem>
                ))
            )}
          </Select>
        </FormControl>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2 }}>
        <TextField
          size="small"
          label="Time Limit (min, 0=none)"
          type="number"
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(e.target.value)}
        />
        <TextField
          size="small"
          label="Passing Score %"
          type="number"
          value={passingScore}
          onChange={(e) => setPassingScore(e.target.value)}
        />
        <TextField
          size="small"
          label="Max Attempts (0=unlimited)"
          type="number"
          value={maxAttempts}
          onChange={(e) => setMaxAttempts(e.target.value)}
        />
      </Box>

      <Stack direction="row" gap={2} mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showCorrectAnswers}
              onChange={(e) => setShowCorrectAnswers(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={<Typography variant="body2">Show correct answers after submission</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              checked={randomizeQuestions}
              onChange={(e) => setRandomizeQuestions(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={<Typography variant="body2">Randomize questions</Typography>}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Questions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          Questions ({questions.length})
        </Typography>
        <Stack direction="row" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={generating ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
            onClick={() => setAiDialogOpen(true)}
            sx={{
              textTransform: "none",
              borderColor: pendingResult ? "success.main" : "brand.main",
              color: pendingResult ? "success.main" : "brand.main",
              "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
            }}
          >
            {generating ? "Generating..." : pendingResult ? "Results Ready" : "AI Generate"}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ textTransform: "none", borderColor: "brand.main", color: "brand.main" }}
          >
            Add Question
          </Button>
        </Stack>
      </Stack>

      {questions.map((q, qi) => (
        <QuestionEditor
          key={qi}
          question={q}
          index={qi}
          onUpdate={(updated) =>
            setQuestions(questions.map((x, i) => (i === qi ? updated : x)))
          }
          onDelete={() => setQuestions(questions.filter((_, i) => i !== qi))}
        />
      ))}

      {savedMsg && (
        <Alert
          severity={savedMsg.startsWith("Error") ? "error" : "success"}
          sx={{ mb: 1.5 }}
        >
          {savedMsg}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
          disabled={saving}
          onClick={handleSave}
          sx={{
            bgcolor: "brand.main",
            "&:hover": { bgcolor: "brand.dark" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {saving ? "Saving..." : "Save Quiz"}
        </Button>
      </Box>

      <AIQuizGeneratorDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        item={item}
        courseId={courseId}
        relatedItemId={relatedItemId}
        sections={sections}
        onApply={handleApplyGenerated}
        generating={generating}
        setGenerating={setGenerating}
        progress={progress}
        pendingResult={pendingResult}
        clearPendingResult={() => setPendingResult(null)}
      />
    </Box>
  );
}

export default QuizEditor;
